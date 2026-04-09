import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type UserRow = {
  user_id: number;
  email: string;
  password_hash: string;
  role: 'student' | 'instructor' | 'admin';
  is_email_verified?: boolean;
  created_at: string;
  updated_at: string;
};

export class UserRepository extends BaseRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    return this.queryOne<UserRow>(
      pgPool,
      `SELECT user_id, email, password_hash, role, created_at, updated_at
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
  }

  async findById(userId: number): Promise<UserRow | null> {
    return this.queryOne<UserRow>(
      pgPool,
      `SELECT user_id, email, password_hash, role, created_at, updated_at
       FROM users
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
  }

  async create(params: { email: string; passwordHash: string; role: UserRow['role'] }): Promise<UserRow> {
    const row = await this.queryOne<UserRow>(
      pgPool,
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, 'First', 'Last', $3)
       RETURNING user_id, email, password_hash, role, is_email_verified, created_at, updated_at`,
      [params.email, params.passwordHash, params.role],
    );
    if (!row) this.notFound('Failed to create user');
    return row;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.exec(
      pgPool,
      `UPDATE users SET last_login_at = NOW() WHERE user_id = $1`,
      [userId],
    );
  }

  async markEmailVerified(userId: number): Promise<void> {
    await this.exec(
      pgPool,
      `UPDATE users SET is_email_verified = true WHERE user_id = $1`,
      [userId],
    );
  }

  async updatePasswordHash(userId: number, passwordHash: string): Promise<void> {
    await this.exec(
      pgPool,
      `UPDATE users SET password_hash = $2 WHERE user_id = $1`,
      [userId, passwordHash],
    );
  }

  async withUserCreateTx(params: { email: string; passwordHash: string; role: UserRow['role'] }): Promise<UserRow> {
    return this.tx(async (client) => {
      const row = await this.queryOne<UserRow>(
        client,
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, 'First', 'Last', $3)
         RETURNING user_id, email, password_hash, role, is_email_verified, created_at, updated_at`,
        [params.email, params.passwordHash, params.role],
      );
      if (!row) this.notFound('Failed to create user');
      return row;
    });
  }
}

