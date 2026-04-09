import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type QuizAttemptAnswerRow = {
  attempt_answer_id: number;
  attempt_id: number;
  question_id: number;
  answer_id: number | null;
  answer_text: string | null;
  is_correct: boolean | null;
  points_awarded: string;
  created_at: string;
};

export class QuizAttemptAnswerRepository extends BaseRepository {
  async upsert(params: {
    attemptId: number;
    questionId: number;
    answerId?: number | null;
    answerText?: string | null;
    isCorrect?: boolean | null;
    pointsAwarded: number;
  }): Promise<QuizAttemptAnswerRow> {
    const row = await this.queryOne<QuizAttemptAnswerRow>(
      pgPool,
      `INSERT INTO quiz_attempt_answers (attempt_id, question_id, answer_id, answer_text, is_correct, points_awarded)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET
         answer_id = EXCLUDED.answer_id,
         answer_text = EXCLUDED.answer_text,
         is_correct = EXCLUDED.is_correct,
         points_awarded = EXCLUDED.points_awarded
       RETURNING *`,
      [
        params.attemptId,
        params.questionId,
        params.answerId ?? null,
        params.answerText ?? null,
        params.isCorrect ?? null,
        params.pointsAwarded,
      ],
    );
    if (!row) this.notFound('Failed to store attempt answer');
    return row;
  }
}

