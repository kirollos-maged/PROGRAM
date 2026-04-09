import { pgPool } from '../config/db';
import { env } from '../config/env';
import { sha256Hex } from '../utils/crypto.util';
import { BaseRepository } from './base.repository';

export type RefreshTokenRow = {
  refresh_token_id: number;
  user_id: number;
  token_hash: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  revoked_at: string | null;
  rotated_from_token_id: number | null;
  created_at: string;
};

export class RefreshTokenRepository extends BaseRepository {
  hash(tokenPlain: string): string {
    return sha256Hex(`${tokenPlain}.${env.tokens.refreshTokenPepper}`);
  }

  async create(params: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    deviceFingerprint?: string;
    ipAddress?: string;
    userAgent?: string;
    rotatedFromTokenId?: number | null;
  }): Promise<RefreshTokenRow> {
    const row = await this.queryOne<RefreshTokenRow>(
      pgPool,
      `INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at, device_fingerprint, ip_address, user_agent, rotated_from_token_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        params.userId,
        params.tokenHash,
        params.expiresAt,
        params.deviceFingerprint ?? null,
        params.ipAddress ?? null,
        params.userAgent ?? null,
        params.rotatedFromTokenId ?? null,
      ],
    );
    if (!row) this.notFound('Failed to create refresh token');
    return row;
  }

  async findActiveByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    return this.queryOne<RefreshTokenRow>(
      pgPool,
      `SELECT *
       FROM refresh_tokens
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > NOW()`,
      [tokenHash],
    );
  }

  async revokeById(refreshTokenId: number): Promise<void> {
    await this.exec(
      pgPool,
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE refresh_token_id = $1 AND revoked_at IS NULL`,
      [refreshTokenId],
    );
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.exec(
      pgPool,
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  }
}

