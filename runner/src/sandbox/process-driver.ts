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

export class ProcessSandboxDriver implements SandboxDriver {
  async compile(options: CompileOptions): Promise<CompileResult> {
    if (options.language !== Language.CPP) {
      return {
        success: false,
        output: `Language ${options.language} not supported.`,
      };
    }

    const sourcePath = path.join(options.workspaceDir, 'solution.cpp');
    const binaryExt = process.platform === 'win32' ? '.exe' : '';
    const binaryPath = path.join(options.workspaceDir, `solution${binaryExt}`);

    await fs.writeFile(sourcePath, options.sourceCode, 'utf8');

    return new Promise<CompileResult>((resolve) => {
      const proc = spawn('g++', ['-O3', '-std=c++17', '-Wall', sourcePath, '-o', binaryPath]);

      let output = '';
      proc.stdout.on('data', (d) => (output += d.toString()));
      proc.stderr.on('data', (d) => (output += d.toString()));

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
            binaryPath,
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
          output: `Local compiler error: ${err.message}. Ensure g++ is installed or use Docker driver.`,
        });
      });
    });
  }

  async execute(options: ExecutionOptions): Promise<RawExecutionResult> {
    return new Promise<RawExecutionResult>((resolve) => {
      const startTime = process.hrtime.bigint();
      const proc = spawn(options.binaryPath, [], {
        cwd: options.workspaceDir,
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      const maxOutputBytes = env.MAX_OUTPUT_SIZE_BYTES;

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

      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGKILL');
      }, options.timeLimitMs + 500);

      proc.on('close', (code) => {
        clearTimeout(timer);
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        resolve({
          exitCode: code,
          stdout,
          stderr,
          executionTimeMs: Math.round(durationMs),
          memoryKb: 4096,
          timedOut,
          oomKilled: false,
        });
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          stdout: '',
          stderr: `Process execution error: ${err.message}`,
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
      // Ignore cleanup error
    }
  }
}
