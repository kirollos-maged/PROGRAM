import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type QuizAttemptRow = {
  attempt_id: number;
  quiz_id: number;
  student_id: number;
  started_at: string;
  completed_at: string | null;
  score: string | null;
  max_score: string | null;
  passed: boolean | null;
  completed?: boolean;
  created_at: string;
  updated_at: string;
};

export class QuizAttemptRepository extends BaseRepository {
  async countAttempts(studentId: number, quizId: number): Promise<number> {
    const row = await this.queryOne<{ cnt: string }>(
      pgPool,
      `SELECT COUNT(*)::text AS cnt FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2`,
      [studentId, quizId],
    );
    return row ? Number(row.cnt) : 0;
  }

  async create(params: { quizId: number; studentId: number }): Promise<QuizAttemptRow> {
    const row = await this.queryOne<QuizAttemptRow>(
      pgPool,
      `INSERT INTO quiz_attempts (quiz_id, student_id, started_at)
       VALUES ($1,$2,NOW())
       RETURNING *`,
      [params.quizId, params.studentId],
    );
    if (!row) this.notFound('Failed to create quiz attempt');
    return row;
  }

  async findById(attemptId: number): Promise<QuizAttemptRow | null> {
    return this.queryOne<QuizAttemptRow>(pgPool, `SELECT * FROM quiz_attempts WHERE attempt_id = $1`, [attemptId]);
  }

  async complete(params: { attemptId: number; score: number; maxScore: number; passed: boolean }) {
    const row = await this.queryOne<QuizAttemptRow>(
      pgPool,
      `UPDATE quiz_attempts
       SET completed_at = NOW(),
           score = $2,
           max_score = $3,
           passed = $4,
           completed = true,
           updated_at = NOW()
       WHERE attempt_id = $1
       RETURNING *`,
      [params.attemptId, params.score, params.maxScore, params.passed],
    );
    if (!row) this.notFound('Attempt not found');
    return row;
  }
}

