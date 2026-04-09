import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type EmailVerificationRow = {
  verification_id: number;
  user_id: number;
  token: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
};

export class EmailVerificationRepository extends BaseRepository {
  async create(params: { userId: number; tokenHash: string; expiresAt: Date }): Promise<EmailVerificationRow> {
    const row = await this.queryOne<EmailVerificationRow>(
      pgPool,
      `INSERT INTO email_verification (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.userId, params.tokenHash, params.expiresAt],
    );
    if (!row) this.notFound('Failed to create email verification token');
    return row;
  }

  async verifyByTokenHash(tokenHash: string): Promise<EmailVerificationRow | null> {
    const row = await this.queryOne<EmailVerificationRow>(
      pgPool,
      `SELECT *
       FROM email_verification
       WHERE token = $1
         AND verified_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash],
    );
    if (!row) return null;

    await this.exec(
      pgPool,
      `UPDATE email_verification SET verified_at = NOW() WHERE verification_id = $1`,
      [row.verification_id],
    );
    return row;
  }
}

