import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Language } from '@wecode/shared';
import { env } from '../config/env';
import {
  CompileOptions,
  CompileResult,
  ExecutionOptions,
  RawExecutionResult,
  SandboxDriver,
} from './types';

export class DockerSandboxDriver implements SandboxDriver {
  private dockerImage = env.DOCKER_IMAGE_CPP;

  async compile(options: CompileOptions): Promise<CompileResult> {
    if (options.language !== Language.CPP) {
      return {
        success: false,
        output: `Language ${options.language} is not supported by this C++ runner worker.`,
      };
    }

    const sourcePath = path.join(options.workspaceDir, 'solution.cpp');
    await fs.writeFile(sourcePath, options.sourceCode, 'utf8');

    // Docker compile command: runs with no network, memory ceiling, and timeout
    const dockerArgs = [
      'run',
      '--rm',
      '--network',
      'none',
      '--memory',
      '512m',
      '--cpus',
      '1.0',
      '-v',
      `${path.resolve(options.workspaceDir)}:/sandbox:rw`,
      this.dockerImage,
      'g++',
      '-O3',
      '-std=c++17',
      '-Wall',
      '/sandbox/solution.cpp',
      '-o',
      '/sandbox/solution',
    ];

    return new Promise<CompileResult>((resolve) => {
      const proc = spawn('docker', dockerArgs);
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      // 15 seconds compilation hard timeout
      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        resolve({
          success: false,
          output: 'Compilation timed out after 15 seconds.',
        });
      }, 15000);

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve({
            success: true,
            output,
            binaryPath: path.join(options.workspaceDir, 'solution'),
          });
        } else {
          resolve({
            success: false,
            output: output || 'Compilation failed with non-zero exit code.',
          });
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          success: false,
          output: `Docker execution error during compile: ${err.message}`,
        });
      });
    });
  }

  async execute(options: ExecutionOptions): Promise<RawExecutionResult> {
    const memLimit = `${options.memoryLimitMb}m`;
    const resolvedWorkspace = path.resolve(options.workspaceDir);

    // Docker execution flags implementing defense-in-depth:
    // - Complete network isolation (--network none)
    // - Strict memory ceiling and swap disabling
    // - Hard CPU core quota
    // - Process/Thread limit to prevent fork bombs (--pids-limit 64)
    // - Read-only root filesystem (--read-only)
    // - Dropping all Linux kernel capabilities (--cap-drop=ALL)
    // - Preventing privilege escalation (--security-opt=no-new-privileges:true)
    const dockerArgs = [
      'run',
      '--rm',
      '-i',
      '--network',
      'none',
      '--memory',
      memLimit,
      '--memory-swap',
      memLimit,
      '--cpus',
      '1.0',
      '--pids-limit',
      '64',
      '--read-only',
      '--security-opt=no-new-privileges:true',
      '--cap-drop=ALL',
      '-v',
      `${resolvedWorkspace}/solution:/sandbox/solution:ro`,
      this.dockerImage,
      '/sandbox/solution',
    ];

    return new Promise<RawExecutionResult>((resolve) => {
      const startTime = process.hrtime.bigint();
      const proc = spawn('docker', dockerArgs);

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      const maxOutputBytes = env.MAX_OUTPUT_SIZE_BYTES;

      // Pipe test case stdin into process
      if (options.stdin) {
        proc.stdin.write(options.stdin);
      }
      proc.stdin.end();

      proc.stdout.on('data', (chunk) => {
        if (stdout.length < maxOutputBytes) {
          stdout += chunk.toString();
        }
      });

      proc.stderr.on('data', (chunk) => {
        if (stderr.length < maxOutputBytes) {
          stderr += chunk.toString();
        }
      });

      // Watchdog timer: kill container if execution exceeds timeLimitMs + 500ms grace
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGKILL');
      }, options.timeLimitMs + 500);

      proc.on('close', (code) => {
        clearTimeout(timeoutHandle);
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        // OOM detection: exit code 137 typically indicates killed by SIGKILL / OOM
        const oomKilled = code === 137 && !timedOut;

        resolve({
          exitCode: code,
          stdout,
          stderr,
          executionTimeMs: Math.round(durationMs),
          memoryKb: options.memoryLimitMb * 1024,
          timedOut,
          oomKilled,
        });
      });

      proc.on('error', (err) => {
        clearTimeout(timeoutHandle);
        resolve({
          exitCode: 1,
          stdout: '',
          stderr: `Docker runner error: ${err.message}`,
          executionTimeMs: 0,
          memoryKb: 0,
          timedOut: false,
          oomKilled: false,
        });
      });
    });
  }

  async cleanup(workspaceDir: string): Promise<void> {
    try {
      await fs.rm(workspaceDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}
