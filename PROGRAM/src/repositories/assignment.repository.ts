import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type AssignmentRow = {
  assignment_id: number;
  course_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: string; // schema.sql currently uses max_score
  allow_resubmission?: boolean;
  max_attempts?: number;
  created_at: string;
  updated_at: string;
};

export class AssignmentRepository extends BaseRepository {
  async findById(assignmentId: number): Promise<AssignmentRow | null> {
    return this.queryOne<AssignmentRow>(
      pgPool,
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentId],
    );
  }
}

