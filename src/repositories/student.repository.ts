import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export class StudentRepository extends BaseRepository {
  async findStudentIdByUserId(userId: number): Promise<number | null> {
    const row = await this.queryOne<{ student_id: number }>(
      pgPool,
      `SELECT student_id FROM students WHERE user_id = $1`,
      [userId],
    );
    return row?.student_id ?? null;
  }
}

