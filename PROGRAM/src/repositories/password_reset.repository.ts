import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type PasswordResetRow = {
  token_id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export class PasswordResetRepository extends BaseRepository {
  async create(params: { userId: number; tokenHash: string; expiresAt: Date }): Promise<PasswordResetRow> {
    const row = await this.queryOne<PasswordResetRow>(
      pgPool,
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.userId, params.tokenHash, params.expiresAt],
    );
    if (!row) this.notFound('Failed to create password reset token');
    return row;
  }

  async consumeByTokenHash(tokenHash: string): Promise<PasswordResetRow | null> {
    const row = await this.queryOne<PasswordResetRow>(
      pgPool,
      `SELECT *
       FROM password_reset_tokens
       WHERE token = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash],
    );
    if (!row) return null;

    await this.exec(
      pgPool,
      `UPDATE password_reset_tokens SET used_at = NOW() WHERE token_id = $1`,
      [row.token_id],
    );
    return row;
  }
}

