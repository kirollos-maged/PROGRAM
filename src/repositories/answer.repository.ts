import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type AnswerRow = {
  answer_id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export class AnswerRepository extends BaseRepository {
  async listByQuestion(questionId: number): Promise<AnswerRow[]> {
    return this.queryMany<AnswerRow>(
      pgPool,
      `SELECT * FROM answers WHERE question_id = $1 ORDER BY sort_order ASC, answer_id ASC`,
      [questionId],
    );
  }

  async create(params: { questionId: number; answerText: string; isCorrect: boolean; sortOrder: number }): Promise<AnswerRow> {
    const row = await this.queryOne<AnswerRow>(
      pgPool,
      `INSERT INTO answers (question_id, answer_text, is_correct, sort_order)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [params.questionId, params.answerText, params.isCorrect, params.sortOrder],
    );
    if (!row) this.notFound('Failed to create answer');
    return row;
  }
}

