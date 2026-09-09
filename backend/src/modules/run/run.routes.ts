import { Router } from 'express';
import { runCodeSchema } from '@wecode/shared';
import { authenticate } from '../../middleware/authenticate';
import { runCodeRateLimiter } from '../../middleware/rate-limiter';
import { validateBody } from '../../middleware/validate';
import { runController } from './run.controller';

const router = Router();

router.post(
  '/problems/:slug/run',
  authenticate,
  runCodeRateLimiter,
  validateBody(runCodeSchema),
  (req, res, next) => runController.runCode(req, res).catch(next)
);

export const runRouter = router;
