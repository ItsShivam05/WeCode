import { NextFunction, Request, Response } from 'express';
import { Role } from '@wecode/shared';
import { AppError } from './error-handler';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        `Access forbidden: requires one of [${allowedRoles.join(', ')}] role`
      );
    }

    next();
  };
}
