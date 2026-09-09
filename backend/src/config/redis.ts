import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  lazyConnect: true,
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis server');
});

redisClient.on('error', (err) => {
  logger.warn({ err }, 'Redis connection warning/error');
});
