import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type QuizRow = {
  quiz_id: number;
  course_id: number;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: string;
  max_attempts: number | null;
  is_randomized?: boolean;
  created_at: string;
  updated_at: string;
};

export class QuizRepository extends BaseRepository {
  async findById(quizId: number): Promise<QuizRow | null> {
    return this.queryOne<QuizRow>(pgPool, `SELECT * FROM quizzes WHERE quiz_id = $1`, [quizId]);
  }

  async create(params: {
    courseId: number;
    title: string;
    description?: string | null;
    timeLimitMinutes?: number | null;
    passingScore?: number;
    maxAttempts?: number | null;
    isRandomized?: boolean;
  }): Promise<QuizRow> {
    const row = await this.queryOne<QuizRow>(
      pgPool,
      `INSERT INTO quizzes
        (course_id, title, description, time_limit_minutes, passing_score, max_attempts, is_randomized)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        params.courseId,
        params.title,
        params.description ?? null,
        params.timeLimitMinutes ?? null,
        params.passingScore ?? 70,
        params.maxAttempts ?? null,
        params.isRandomized ?? false,
      ],
    );
    if (!row) this.notFound('Failed to create quiz');
    return row;
  }

  async update(quizId: number, patch: Partial<{
    title: string;
    description: string | null;
    timeLimitMinutes: number | null;
    passingScore: number;
    maxAttempts: number | null;
    isRandomized: boolean;
  }>): Promise<QuizRow> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => {
      sets.push(`${col} = $${i++}`);
      values.push(val);
    };

    if (patch.title !== undefined) add('title', patch.title);
    if (patch.description !== undefined) add('description', patch.description);
    if (patch.timeLimitMinutes !== undefined) add('time_limit_minutes', patch.timeLimitMinutes);
    if (patch.passingScore !== undefined) add('passing_score', patch.passingScore);
    if (patch.maxAttempts !== undefined) add('max_attempts', patch.maxAttempts);
    if (patch.isRandomized !== undefined) add('is_randomized', patch.isRandomized);

    if (sets.length === 0) {
      const row = await this.findById(quizId);
      if (!row) this.notFound('Quiz not found');
      return row;
    }

    values.push(quizId);
    const row = await this.queryOne<QuizRow>(
      pgPool,
      `UPDATE quizzes SET ${sets.join(', ')}, updated_at = NOW()
       WHERE quiz_id = $${i}
       RETURNING *`,
      values,
    );
    if (!row) this.notFound('Quiz not found');
    return row;
  }
}

