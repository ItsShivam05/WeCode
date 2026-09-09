import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { generalRateLimiter } from './middleware/rate-limiter';
import { aiRouter } from './modules/ai/ai.routes';
import { authRouter } from './modules/auth/auth.routes';
import { problemsRouter } from './modules/problems/problems.routes';
import { runRouter } from './modules/run/run.routes';
import { submissionsRouter } from './modules/submissions/submissions.routes';
import { usersRouter } from './modules/users/users.routes';

export const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General Rate Limiting
app.use(generalRateLimiter);

// Liveness & Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'wecode-backend',
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/problems', problemsRouter);
app.use('/api/v1', submissionsRouter);
app.use('/api/v1', runRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/ai', aiRouter);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);
