import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@wecode/shared';
import { env } from '../config/env';
import { AppError } from './error-handler';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required');
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = payload;
    next();
  } catch (err) {
    throw new AppError(401, 'INVALID_TOKEN', 'Token has expired or is invalid');
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
      req.user = payload;
    } catch {
      // Ignore token validation failure for optional auth
    }
  }
  next();
}
