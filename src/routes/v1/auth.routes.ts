import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validation.middleware';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../../validation/auth.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/password-reset/request', authLimiter, validate(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/password-reset/confirm', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

export default router;

