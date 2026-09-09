import { Router } from 'express';
import { aiHintSchema } from '@wecode/shared';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { aiController } from './ai.controller';

const router = Router();

router.post('/hint', authenticate, validateBody(aiHintSchema), (req, res, next) =>
  aiController.getHint(req, res).catch(next)
);

export const aiRouter = router;
