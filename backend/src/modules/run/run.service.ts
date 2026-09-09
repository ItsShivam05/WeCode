import { QueueEvents } from 'bullmq';
import {
  Language,
  RunCodeResultDto,
  RunnerResult,
  RunnerTask,
  TestCaseToJudge,
  Verdict,
} from '@wecode/shared';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AppError } from '../../middleware/error-handler';
import { RUN_QUEUE_NAME, getRunQueue } from '../../queue/submission-queue';

let runQueueEvents: QueueEvents | null = null;

function getRunQueueEvents(): QueueEvents {
  if (!runQueueEvents) {
    runQueueEvents = new QueueEvents(RUN_QUEUE_NAME, {
      connection: { url: env.REDIS_URL, maxRetriesPerRequest: null },
    });
  }
  return runQueueEvents;
}

export class RunService {
  async runCode(
    problemSlug: string,
    language: Language,
    code: string,
    customInput?: string
  ): Promise<RunCodeResultDto> {
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      include: {
        testCases: {
          where: { isSample: true },
          take: 1,
        },
      },
    });

    if (!problem) {
      throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Problem not found');
    }

    const taskId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // If customInput was passed, use it. Otherwise use the first sample test case
    let testCasesToRun: TestCaseToJudge[] = [];
    if (customInput !== undefined && customInput !== null) {
      testCasesToRun = [
        {
          id: 'custom-input',
          orderIndex: 0,
          isSample: true,
          inputData: customInput,
          expectedOutput: '', // No expected output for custom runs
          points: 0,
        },
      ];
    } else if (problem.testCases.length > 0) {
      testCasesToRun = [
        {
          id: problem.testCases[0].id,
          orderIndex: 0,
          isSample: true,
          inputData: problem.testCases[0].inputData,
          expectedOutput: problem.testCases[0].expectedOutput,
          points: 0,
        },
      ];
    } else {
      testCasesToRun = [
        {
          id: 'empty-test',
          orderIndex: 0,
          isSample: true,
          inputData: '',
          expectedOutput: '',
          points: 0,
        },
      ];
    }

    const task: RunnerTask = {
      taskId,
      problemId: problem.id,
      language,
      code,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      testCases: testCasesToRun,
      isSubmission: false,
    };

    try {
      const queue = getRunQueue();
      const job = await queue.add(`job-${taskId}`, task, { priority: 1 });
      const events = getRunQueueEvents();

      // Wait for job completion (up to 12 seconds)
      const result = (await job.waitUntilFinished(events, 12000)) as RunnerResult;

      const single = result.testCaseResults[0];
      return {
        verdict: result.verdict,
        executionTimeMs: result.executionTimeMs,
        memoryKb: result.memoryKb,
        stdout: single?.stdout || '',
        stderr: single?.stderr || '',
        compileOutput: result.compileOutput,
      };
    } catch (err: any) {
      logger.error({ err }, 'Error executing transient run');
      if (err.message?.includes('timed out')) {
        return {
          verdict: Verdict.TIME_LIMIT_EXCEEDED,
          executionTimeMs: problem.timeLimitMs,
          memoryKb: 0,
          stdout: '',
          stderr: 'Execution timed out waiting for worker.',
        };
      }
      return {
        verdict: Verdict.SYSTEM_ERROR,
        executionTimeMs: 0,
        memoryKb: 0,
        stdout: '',
        stderr: 'Execution worker unavailable or failed to respond.',
      };
    }
  }
}

export const runService = new RunService();
