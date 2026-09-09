import pino from 'pino';
import { env } from './config/env';
import { startRunWorker, startRunnerWorker } from './queue/worker';

const logger = pino();

logger.info(
  { driver: env.SANDBOX_DRIVER, concurrency: env.RUNNER_CONCURRENCY },
  'Starting WeCode Runner Worker service...'
);

const submissionWorker = startRunnerWorker();
const runWorker = startRunWorker();

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Closing runner workers...`);
  await Promise.all([submissionWorker.close(), runWorker.close()]);
  logger.info('Runner workers closed gracefully.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
