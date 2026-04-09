import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type AssignmentSubmissionRow = {
  submission_id: number;
  assignment_id: number;
  student_id: number;
  submitted_at: string;
  content: string | null;
  file_url: string | null;
  score: string | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: number | null;
  created_at: string;
  updated_at: string;
};

export class AssignmentSubmissionRepository extends BaseRepository {
  async countByStudent(assignmentId: number, studentId: number): Promise<number> {
    const row = await this.queryOne<{ cnt: string }>(
      pgPool,
      `SELECT COUNT(*)::text AS cnt
       FROM assignment_submissions
       WHERE assignment_id = $1 AND student_id = $2`,
      [assignmentId, studentId],
    );
    return row ? Number(row.cnt) : 0;
  }

  async create(params: {
    assignmentId: number;
    studentId: number;
    content?: string | null;
    fileUrl?: string | null;
  }): Promise<AssignmentSubmissionRow> {
    const row = await this.queryOne<AssignmentSubmissionRow>(
      pgPool,
      `INSERT INTO assignment_submissions (assignment_id, student_id, submitted_at, content, file_url)
       VALUES ($1,$2,NOW(),$3,$4)
       RETURNING *`,
      [params.assignmentId, params.studentId, params.content ?? null, params.fileUrl ?? null],
    );
    if (!row) this.notFound('Failed to create submission');
    return row;
  }

  async listByStudent(assignmentId: number, studentId: number): Promise<AssignmentSubmissionRow[]> {
    return this.queryMany<AssignmentSubmissionRow>(
      pgPool,
      `SELECT *
       FROM assignment_submissions
       WHERE assignment_id = $1 AND student_id = $2
       ORDER BY submitted_at DESC`,
      [assignmentId, studentId],
    );
  }

  async findById(submissionId: number): Promise<AssignmentSubmissionRow | null> {
    return this.queryOne<AssignmentSubmissionRow>(
      pgPool,
      `SELECT * FROM assignment_submissions WHERE submission_id = $1`,
      [submissionId],
    );
  }

  async grade(params: {
    submissionId: number;
    instructorId: number;
    score: number;
    feedback?: string | null;
  }): Promise<AssignmentSubmissionRow> {
    const row = await this.queryOne<AssignmentSubmissionRow>(
      pgPool,
      `UPDATE assignment_submissions
       SET score = $2,
           feedback = $3,
           graded_at = NOW(),
           graded_by = $4,
           updated_at = NOW()
       WHERE submission_id = $1
       RETURNING *`,
      [params.submissionId, params.score, params.feedback ?? null, params.instructorId],
    );
    if (!row) this.notFound('Submission not found');
    return row;
  }
}

