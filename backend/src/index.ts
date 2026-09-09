import { app } from './app';
import { prisma } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';
import { redisClient } from './config/redis';

const port = env.API_PORT;

const server = app.listen(port, () => {
  logger.info(`WeCode Backend API listening on port ${port} in ${env.NODE_ENV} mode`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
      await redisClient.quit();
      logger.info('Redis connection closed');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
