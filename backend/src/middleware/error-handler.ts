import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '@wecode/shared';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Handle AppError (Known operational errors)
  if (err instanceof AppError) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError || err.name === 'ZodError' || 'issues' in err) {
    const issues = (err as any).issues || (err as any).errors || [];
    const details = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
    }));

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload failed validation',
        details,
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Unknown / Internal Server Error
  logger.error({ err }, 'Unhandled Internal Server Error');
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
    },
  };
  res.status(500).json(errorResponse);
}
