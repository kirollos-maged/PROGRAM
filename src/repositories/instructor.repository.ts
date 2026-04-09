import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export class InstructorRepository extends BaseRepository {
  async findInstructorIdByUserId(userId: number): Promise<number | null> {
    const row = await this.queryOne<{ instructor_id: number }>(
      pgPool,
      `SELECT instructor_id FROM instructors WHERE user_id = $1`,
      [userId],
    );
    return row?.instructor_id ?? null;
  }
}

