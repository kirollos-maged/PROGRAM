import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export class LoginAttemptRepository extends BaseRepository {
  async record(params: {
    userId?: number | null;
    email?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    success: boolean;
  }): Promise<void> {
    await this.exec(
      pgPool,
      `INSERT INTO login_attempts (user_id, email, ip_address, user_agent, success)
       VALUES ($1, $2, $3, $4, $5)`,
      [params.userId ?? null, params.email ?? null, params.ipAddress ?? null, params.userAgent ?? null, params.success],
    );
  }

  async countRecentFailures(params: { email: string; ipAddress?: string; windowMinutes: number }): Promise<number> {
    const row = await this.queryOne<{ cnt: string }>(
      pgPool,
      `SELECT COUNT(*)::text AS cnt
       FROM login_attempts
       WHERE success = false
         AND email = $1
         AND ($2::inet IS NULL OR ip_address = $2::inet)
         AND created_at > NOW() - ($3::text || ' minutes')::interval`,
      [params.email, params.ipAddress ?? null, String(params.windowMinutes)],
    );
    return row ? Number(row.cnt) : 0;
  }
}

