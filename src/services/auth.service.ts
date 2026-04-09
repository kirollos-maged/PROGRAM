import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';
import { randomToken, sha256Hex } from '../utils/crypto.util';
import { env } from '../config/env';
import { RepositoryError } from '../repositories/errors';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh_token.repository';
import { LoginAttemptRepository } from '../repositories/login_attempt.repository';
import { EmailVerificationRepository } from '../repositories/email_verification.repository';
import { PasswordResetRepository } from '../repositories/password_reset.repository';

const LOGIN_FAILURE_WINDOW_MINUTES = 15;
const LOGIN_FAILURE_LIMIT = 10;

function hashOneTimeToken(tokenPlain: string): string {
  return sha256Hex(tokenPlain);
}

export class AuthService {
  private users = new UserRepository();
  private refreshTokens = new RefreshTokenRepository();
  private loginAttempts = new LoginAttemptRepository();
  private emailVerifications = new EmailVerificationRepository();
  private passwordResets = new PasswordResetRepository();

  async register(params: { email: string; password: string }) {
    const existing = await this.users.findByEmail(params.email);
    if (existing) {
      throw new RepositoryError('conflict', 'Email already in use', 409);
    }

    const passwordHash = await PasswordUtil.hash(params.password);
    const user = await this.users.create({ email: params.email, passwordHash, role: 'student' });

    const tokenPlain = randomToken(32);
    const tokenHash = hashOneTimeToken(tokenPlain);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await this.emailVerifications.create({ userId: user.user_id, tokenHash, expiresAt });

    // TODO: send email. For now, return token in response for integration/testing.
    return { user: { userId: user.user_id, email: user.email, role: user.role }, emailVerificationToken: tokenPlain };
  }

  async login(params: { email: string; password: string; ip: string; userAgent: string; deviceFingerprint: string }) {
    const recentFailures = await this.loginAttempts.countRecentFailures({
      email: params.email,
      ipAddress: params.ip || undefined,
      windowMinutes: LOGIN_FAILURE_WINDOW_MINUTES,
    });
    if (recentFailures >= LOGIN_FAILURE_LIMIT) {
      throw new RepositoryError('validation', 'Too many failed login attempts', 429);
    }

    const user = await this.users.findByEmail(params.email);
    if (!user) {
      await this.loginAttempts.record({
        userId: null,
        email: params.email,
        ipAddress: params.ip,
        userAgent: params.userAgent,
        success: false,
      });
      throw new RepositoryError('unauthorized', 'Invalid credentials', 401);
    }

    const valid = await PasswordUtil.compare(params.password, user.password_hash);
    await this.loginAttempts.record({
      userId: user.user_id,
      email: params.email,
      ipAddress: params.ip,
      userAgent: params.userAgent,
      success: valid,
    });
    if (!valid) {
      throw new RepositoryError('unauthorized', 'Invalid credentials', 401);
    }

    await this.users.updateLastLogin(user.user_id);

    const accessToken = JwtUtil.signAccessToken({ id: user.user_id, role: user.role });
    const refreshTokenPlain = randomToken(48);
    const tokenHash = this.refreshTokens.hash(refreshTokenPlain);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await this.refreshTokens.create({
      userId: user.user_id,
      tokenHash,
      expiresAt,
      deviceFingerprint: params.deviceFingerprint,
      ipAddress: params.ip,
      userAgent: params.userAgent,
    });

    return {
      user: { userId: user.user_id, email: user.email, role: user.role },
      accessToken,
      refreshToken: refreshTokenPlain,
    };
  }

  async refresh(refreshTokenPlain: string) {
    if (!refreshTokenPlain) {
      throw new RepositoryError('unauthorized', 'Missing refresh token', 401);
    }

    const tokenHash = this.refreshTokens.hash(refreshTokenPlain);
    const existing = await this.refreshTokens.findActiveByHash(tokenHash);
    if (!existing) {
      throw new RepositoryError('unauthorized', 'Invalid refresh token', 401);
    }

    // Get user role
    const user = await this.users.findById(existing.user_id);
    if (!user) {
      throw new RepositoryError('unauthorized', 'User not found', 401);
    }

    // rotation: revoke existing, create new linked token
    await this.refreshTokens.revokeById(existing.refresh_token_id);

    const newRefreshPlain = randomToken(48);
    const newHash = this.refreshTokens.hash(newRefreshPlain);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await this.refreshTokens.create({
      userId: existing.user_id,
      tokenHash: newHash,
      expiresAt,
      deviceFingerprint: existing.device_fingerprint ?? undefined,
      ipAddress: existing.ip_address ?? undefined,
      userAgent: existing.user_agent ?? undefined,
      rotatedFromTokenId: existing.refresh_token_id,
    });

    const accessToken = JwtUtil.signAccessToken({ id: existing.user_id, role: user.role });
    return { accessToken, refreshToken: newRefreshPlain };
  }

  async logout(refreshTokenPlain: string) {
    if (!refreshTokenPlain) return;
    const tokenHash = this.refreshTokens.hash(refreshTokenPlain);
    const existing = await this.refreshTokens.findActiveByHash(tokenHash);
    if (!existing) return;
    await this.refreshTokens.revokeById(existing.refresh_token_id);
  }

  async logoutAll(refreshTokenPlain: string) {
    if (!refreshTokenPlain) return;
    const tokenHash = this.refreshTokens.hash(refreshTokenPlain);
    const existing = await this.refreshTokens.findActiveByHash(tokenHash);
    if (!existing) return;
    await this.refreshTokens.revokeAllForUser(existing.user_id);
  }

  async verifyEmail(params: { token: string }) {
    const tokenHash = hashOneTimeToken(params.token);
    const verification = await this.emailVerifications.verifyByTokenHash(tokenHash);
    if (!verification) {
      throw new RepositoryError('validation', 'Invalid or expired verification token', 400);
    }
    await this.users.markEmailVerified(verification.user_id);
    return { verified: true };
  }

  async requestPasswordReset(params: { email: string }) {
    const user = await this.users.findByEmail(params.email);
    // always return success (no user enumeration)
    if (!user) return { ok: true };

    const tokenPlain = randomToken(32);
    const tokenHash = hashOneTimeToken(tokenPlain);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await this.passwordResets.create({ userId: user.user_id, tokenHash, expiresAt });

    // TODO: send email. For now, return token in response for integration/testing.
    return { ok: true, passwordResetToken: tokenPlain };
  }

  async resetPassword(params: { token: string; newPassword: string }) {
    const tokenHash = hashOneTimeToken(params.token);
    const row = await this.passwordResets.consumeByTokenHash(tokenHash);
    if (!row) {
      throw new RepositoryError('validation', 'Invalid or expired reset token', 400);
    }
    const passwordHash = await PasswordUtil.hash(params.newPassword);
    await this.users.updatePasswordHash(row.user_id, passwordHash);
    return { ok: true };
  }
}

