import { PrismaClient } from '@prisma/client';
import { Job, Worker } from 'bullmq';
import pino from 'pino';
import { RunnerResult, RunnerTask, SubmissionStatus, Verdict } from '@wecode/shared';
import { env } from '../config/env';
import { JudgeEvaluator } from '../judge/evaluator';

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const prisma = new PrismaClient();
const evaluator = new JudgeEvaluator(env.SANDBOX_DRIVER);

export function startRunnerWorker(): Worker<RunnerTask, RunnerResult> {
  const connection = {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };

  const worker = new Worker<RunnerTask, RunnerResult>(
    'wecode-submissions',
    async (job: Job<RunnerTask>): Promise<RunnerResult> => {
      const task = job.data;
      logger.info(
        { taskId: task.taskId, submissionId: task.submissionId, language: task.language },
        'Starting submission task evaluation'
      );

      // 1. Mark status as RUNNING in DB
      if (task.submissionId) {
        try {
          await prisma.submission.update({
            where: { id: task.submissionId },
            data: {
              status: SubmissionStatus.RUNNING,
              verdict: Verdict.RUNNING,
            },
          });
        } catch (dbErr) {
          logger.warn({ dbErr }, 'Could not update submission status to RUNNING in DB');
        }
      }

      // 2. Perform isolated execution & judging
      const result = await evaluator.evaluate(task);

      // 3. Write final verdict and individual test case results to DB
      if (task.submissionId) {
        try {
          await prisma.$transaction(async (tx) => {
            // Update submission header
            await tx.submission.update({
              where: { id: task.submissionId },
              data: {
                status: SubmissionStatus.COMPLETED,
                verdict: result.verdict,
                executionTimeMs: result.executionTimeMs,
                memoryKb: result.memoryKb,
                errorMessage: result.errorMessage,
              },
            });

            // Insert per-test-case results
            if (result.testCaseResults.length > 0) {
              await tx.submissionResult.createMany({
                data: result.testCaseResults.map((r) => ({
                  submissionId: task.submissionId!,
                  testCaseId: r.testCaseId,
                  verdict: r.verdict,
                  executionTimeMs: r.executionTimeMs,
                  memoryKb: r.memoryKb,
                  stdout: r.stdout,
                  stderr: r.stderr,
                })),
                skipDuplicates: true,
              });
            }
          });

          logger.info(
            { submissionId: task.submissionId, verdict: result.verdict },
            'Successfully saved submission results to database'
          );
        } catch (dbErr) {
          logger.error(
            { dbErr, submissionId: task.submissionId },
            'Failed to persist submission result to DB'
          );
        }
      }

      return result;
    },
    {
      connection,
      concurrency: env.RUNNER_CONCURRENCY,
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Job completed successfully');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Job failed with error');
  });

  return worker;
}

export function startRunWorker(): Worker<RunnerTask, RunnerResult> {
  const connection = {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };

  const worker = new Worker<RunnerTask, RunnerResult>(
    'wecode-runs',
    async (job: Job<RunnerTask>): Promise<RunnerResult> => {
      logger.info({ taskId: job.data.taskId }, 'Executing interactive run');
      return evaluator.evaluate(job.data);
    },
    {
      connection,
      concurrency: env.RUNNER_CONCURRENCY,
    }
  );

  return worker;
}
