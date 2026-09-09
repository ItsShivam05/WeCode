import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { usersController } from './users.controller';

const router = Router();

router.get('/me/stats', authenticate, (req, res, next) =>
  usersController.getMyStats(req, res).catch(next)
);

router.get('/:id/profile', authenticate, (req, res, next) =>
  usersController.getUserProfile(req, res).catch(next)
);

export const usersRouter = router;
