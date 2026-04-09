import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export type QuestionRow = {
  question_id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  points: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export class QuestionRepository extends BaseRepository {
  async listByQuiz(quizId: number, randomized: boolean): Promise<QuestionRow[]> {
    return this.queryMany<QuestionRow>(
      pgPool,
      `SELECT *
       FROM questions
       WHERE quiz_id = $1
       ORDER BY ${randomized ? 'RANDOM()' : 'sort_order ASC, question_id ASC'}`,
      [quizId],
    );
  }

  async create(params: { quizId: number; questionText: string; questionType: QuestionType; points: number; sortOrder: number }): Promise<QuestionRow> {
    const row = await this.queryOne<QuestionRow>(
      pgPool,
      `INSERT INTO questions (quiz_id, question_text, question_type, points, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [params.quizId, params.questionText, params.questionType, params.points, params.sortOrder],
    );
    if (!row) this.notFound('Failed to create question');
    return row;
  }

  async getMaxSortOrder(quizId: number): Promise<number> {
    const row = await this.queryOne<{ max_order: number | null }>(
      pgPool,
      `SELECT MAX(sort_order)::int AS max_order FROM questions WHERE quiz_id = $1`,
      [quizId],
    );
    return row?.max_order ?? 0;
  }
}

