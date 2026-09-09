import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {
  RunnerResult,
  RunnerTask,
  SingleExecutionResult,
  SubmissionStatus,
  Verdict,
} from '@wecode/shared';
import { DockerSandboxDriver } from '../sandbox/docker-driver';
import { ProcessSandboxDriver } from '../sandbox/process-driver';
import { SandboxDriver } from '../sandbox/types';
import { JudgeComparator } from './comparator';

export class JudgeEvaluator {
  private driver: SandboxDriver;

  constructor(driverType: 'docker' | 'process' = 'docker') {
    this.driver = driverType === 'docker' ? new DockerSandboxDriver() : new ProcessSandboxDriver();
  }

  async evaluate(task: RunnerTask): Promise<RunnerResult> {
    const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), `wecode-run-${task.taskId}-`));

    try {
      // 1. Compile Phase
      const compileRes = await this.driver.compile({
        language: task.language,
        sourceCode: task.code,
        workspaceDir,
      });

      if (!compileRes.success) {
        return {
          taskId: task.taskId,
          submissionId: task.submissionId,
          status: SubmissionStatus.COMPLETED,
          verdict: Verdict.COMPILATION_ERROR,
          compileOutput: compileRes.output,
          executionTimeMs: 0,
          memoryKb: 0,
          testCaseResults: [],
          errorMessage: compileRes.output,
        };
      }

      const binaryPath = compileRes.binaryPath!;
      const results: SingleExecutionResult[] = [];
      let maxExecutionTime = 0;
      let maxMemoryKb = 0;
      let overallVerdict = Verdict.ACCEPTED;

      // 2. Execute Test Cases
      for (const tc of task.testCases) {
        const execRes = await this.driver.execute({
          binaryPath,
          stdin: tc.inputData,
          timeLimitMs: task.timeLimitMs,
          memoryLimitMb: task.memoryLimitMb,
          workspaceDir,
        });

        maxExecutionTime = Math.max(maxExecutionTime, execRes.executionTimeMs);
        maxMemoryKb = Math.max(maxMemoryKb, execRes.memoryKb);

        let tcVerdict: Verdict = Verdict.ACCEPTED;

        if (execRes.timedOut || execRes.executionTimeMs > task.timeLimitMs) {
          tcVerdict = Verdict.TIME_LIMIT_EXCEEDED;
        } else if (execRes.oomKilled) {
          tcVerdict = Verdict.MEMORY_LIMIT_EXCEEDED;
        } else if (execRes.exitCode !== 0) {
          tcVerdict = Verdict.RUNTIME_ERROR;
        } else if (task.isSubmission || tc.expectedOutput) {
          const comparison = JudgeComparator.compare(execRes.stdout, tc.expectedOutput);
          if (!comparison.isMatch) {
            tcVerdict = Verdict.WRONG_ANSWER;
          }
        }

        results.push({
          testCaseId: tc.id,
          orderIndex: tc.orderIndex,
          isSample: tc.isSample,
          verdict: tcVerdict,
          executionTimeMs: execRes.executionTimeMs,
          memoryKb: execRes.memoryKb,
          stdout: execRes.stdout,
          stderr: execRes.stderr,
        });

        // Set overall verdict to the first non-ACCEPTED verdict encountered
        if (overallVerdict === Verdict.ACCEPTED && tcVerdict !== Verdict.ACCEPTED) {
          overallVerdict = tcVerdict;
          // In submissions, short-circuit on first failure to conserve compute resources
          if (task.isSubmission) {
            break;
          }
        }
      }

      return {
        taskId: task.taskId,
        submissionId: task.submissionId,
        status: SubmissionStatus.COMPLETED,
        verdict: overallVerdict,
        compileOutput: compileRes.output,
        executionTimeMs: maxExecutionTime,
        memoryKb: maxMemoryKb,
        testCaseResults: results,
      };
    } catch (err: any) {
      return {
        taskId: task.taskId,
        submissionId: task.submissionId,
        status: SubmissionStatus.COMPLETED,
        verdict: Verdict.SYSTEM_ERROR,
        executionTimeMs: 0,
        memoryKb: 0,
        testCaseResults: [],
        errorMessage: `System evaluation exception: ${err.message}`,
      };
    } finally {
      await this.driver.cleanup(workspaceDir);
    }
  }
}
