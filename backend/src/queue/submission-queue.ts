import { Queue } from 'bullmq';
import { RunnerTask } from '@wecode/shared';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const SUBMISSION_QUEUE_NAME = 'wecode-submissions';
export const RUN_QUEUE_NAME = 'wecode-runs';

// Redis connection configuration for BullMQ
const redisOptions = {
  maxRetriesPerRequest: null,
};

let submissionQueue: Queue<RunnerTask> | null = null;
let runQueue: Queue<RunnerTask> | null = null;

export function getSubmissionQueue(): Queue<RunnerTask> {
  if (!submissionQueue) {
    submissionQueue = new Queue<RunnerTask>(SUBMISSION_QUEUE_NAME, {
      connection: {
        url: env.REDIS_URL,
        ...redisOptions,
      },
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 500,
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    });

    submissionQueue.on('error', (err) => {
      logger.error({ err }, 'Submission Queue Error');
    });
  }
  return submissionQueue;
}

export function getRunQueue(): Queue<RunnerTask> {
  if (!runQueue) {
    runQueue = new Queue<RunnerTask>(RUN_QUEUE_NAME, {
      connection: {
        url: env.REDIS_URL,
        ...redisOptions,
      },
      defaultJobOptions: {
        attempts: 1, // Runs do not retry automatically to prevent queue congestion
        removeOnComplete: true,
        removeOnFail: true,
      },
    });

    runQueue.on('error', (err) => {
      logger.error({ err }, 'Run Queue Error');
    });
  }
  return runQueue;
}

export async function enqueueSubmissionTask(task: RunnerTask): Promise<string> {
  const queue = getSubmissionQueue();
  const job = await queue.add(`submission-${task.submissionId}`, task, {
    priority: 10,
  });
  logger.info({ jobId: job.id, submissionId: task.submissionId }, 'Enqueued submission task');
  return job.id || task.taskId;
}

export async function enqueueRunTask(task: RunnerTask): Promise<string> {
  const queue = getRunQueue();
  const job = await queue.add(`run-${task.taskId}`, task, {
    priority: 1, // Higher priority for interactive test runs
  });
  logger.info({ jobId: job.id, taskId: task.taskId }, 'Enqueued interactive run task');
  return job.id || task.taskId;
}
