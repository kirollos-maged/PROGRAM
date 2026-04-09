import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

const authService = new AuthService();

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip: string = req.ip ?? req.socket.remoteAddress ?? '';
      const userAgent: string = req.get('user-agent') ?? '';
      const deviceFingerprint: string = String(req.headers['x-device-fingerprint'] ?? '');

      const result = await authService.login({
        email,
        password,
        ip,
        userAgent,
        deviceFingerprint,
      });

      res.cookie(env.cookies.refreshTokenName, result.refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
      });

      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.register({ email, password });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[env.cookies.refreshTokenName];
      const result = await authService.refresh(refreshToken);
      res.cookie(env.cookies.refreshTokenName, result.refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
      });
      res.json({ accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[env.cookies.refreshTokenName];
      await authService.logout(refreshToken);
      res.clearCookie(env.cookies.refreshTokenName);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[env.cookies.refreshTokenName];
      await authService.logoutAll(refreshToken);
      res.clearCookie(env.cookies.refreshTokenName);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail({ token });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset({ email });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword({ token, newPassword });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

