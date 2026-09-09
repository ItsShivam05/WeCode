import { Router } from 'express';
import { loginSchema, registerSchema } from '@wecode/shared';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { authController } from './auth.controller';

const router = Router();

router.post('/register', validateBody(registerSchema), (req, res, next) =>
  authController.register(req, res).catch(next)
);

router.post('/login', validateBody(loginSchema), (req, res, next) =>
  authController.login(req, res).catch(next)
);

router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res).catch(next));

router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res).catch(next)
);

export const authRouter = router;
