import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from './error-handler';

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new AppError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down.');
  },
});

export const submissionRateLimiter = rateLimit({
  windowMs: env.SUBMISSION_RATE_LIMIT_WINDOW_MS,
  max: env.SUBMISSION_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || 'anonymous';
  },
  handler: () => {
    throw new AppError(
      429,
      'SUBMISSION_RATE_LIMIT_EXCEEDED',
      'You are submitting code too frequently. Please wait a moment before trying again.'
    );
  },
});

export const runCodeRateLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || 'anonymous';
  },
  handler: () => {
    throw new AppError(
      429,
      'RUN_RATE_LIMIT_EXCEEDED',
      'You are running code too frequently. Please wait a moment.'
    );
  },
});
