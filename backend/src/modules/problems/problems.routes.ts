import { Router } from 'express';
import { Role, createProblemSchema, createTestCaseSchema } from '@wecode/shared';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { problemsController } from './problems.controller';

const router = Router();

// Public / Authenticated problem browsing
router.get('/', optionalAuthenticate, (req, res, next) =>
  problemsController.listProblems(req, res).catch(next)
);

router.get('/:slug', optionalAuthenticate, (req, res, next) =>
  problemsController.getProblemBySlug(req, res).catch(next)
);

// Admin-only problem management
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.FACULTY),
  validateBody(createProblemSchema),
  (req, res, next) => problemsController.createProblem(req, res).catch(next)
);

router.post(
  '/:id/testcases',
  authenticate,
  authorize(Role.ADMIN),
  validateBody(createTestCaseSchema),
  (req, res, next) => problemsController.addTestCase(req, res).catch(next)
);

export const problemsRouter = router;
