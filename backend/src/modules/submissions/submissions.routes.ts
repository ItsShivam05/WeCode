import { Router } from 'express';
import { submitCodeSchema } from '@wecode/shared';
import { authenticate } from '../../middleware/authenticate';
import { submissionRateLimiter } from '../../middleware/rate-limiter';
import { validateBody } from '../../middleware/validate';
import { submissionsController } from './submissions.controller';

const router = Router();

// Submit code for a problem
router.post(
  '/problems/:slug/submit',
  authenticate,
  submissionRateLimiter,
  validateBody(submitCodeSchema),
  (req, res, next) => submissionsController.submitCode(req, res).catch(next)
);

// View specific submission (polling or direct view)
router.get('/submissions/:id', authenticate, (req, res, next) =>
  submissionsController.getSubmissionById(req, res).catch(next)
);

// View submission history (optionally filtered by problemSlug)
router.get('/submissions', authenticate, (req, res, next) =>
  submissionsController.listUserSubmissions(req, res).catch(next)
);

export const submissionsRouter = router;
