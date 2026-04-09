import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type SectionRow = {
  section_id: number;
  course_id: number;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export class SectionRepository extends BaseRepository {
  async listByCourse(courseId: number): Promise<SectionRow[]> {
    return this.queryMany<SectionRow>(
      pgPool,
      `SELECT * FROM sections WHERE course_id = $1 ORDER BY sort_order ASC, section_id ASC`,
      [courseId],
    );
  }

  async findById(sectionId: number): Promise<SectionRow | null> {
    return this.queryOne<SectionRow>(
      pgPool,
      `SELECT * FROM sections WHERE section_id = $1`,
      [sectionId],
    );
  }

  async create(params: { courseId: number; title: string; sortOrder: number }): Promise<SectionRow> {
    const row = await this.queryOne<SectionRow>(
      pgPool,
      `INSERT INTO sections (course_id, title, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.courseId, params.title, params.sortOrder],
    );
    if (!row) this.notFound('Failed to create section');
    return row;
  }

  async updateTitle(sectionId: number, courseId: number, title: string): Promise<SectionRow> {
    const row = await this.queryOne<SectionRow>(
      pgPool,
      `UPDATE sections
       SET title = $3, updated_at = NOW()
       WHERE section_id = $1 AND course_id = $2
       RETURNING *`,
      [sectionId, courseId, title],
    );
    if (!row) this.notFound('Section not found');
    return row;
  }

  async getMaxSortOrder(courseId: number): Promise<number> {
    const row = await this.queryOne<{ max_order: number | null }>(
      pgPool,
      `SELECT MAX(sort_order)::int AS max_order FROM sections WHERE course_id = $1`,
      [courseId],
    );
    return row?.max_order ?? 0;
  }
}

