import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type LessonType = 'video' | 'text' | 'quiz' | 'assignment';

export type LessonRow = {
  lesson_id: number;
  section_id: number;
  title: string;
  content: string | null;
  lesson_type: LessonType;
  duration_minutes: number | null;
  video_url: string | null;
  sort_order: number;
  is_free_preview?: boolean;
  is_preview?: boolean;
  created_at: string;
  updated_at: string;
};

export class LessonRepository extends BaseRepository {
  async listBySection(sectionId: number): Promise<LessonRow[]> {
    return this.queryMany<LessonRow>(
      pgPool,
      `SELECT * FROM lessons WHERE section_id = $1 ORDER BY sort_order ASC, lesson_id ASC`,
      [sectionId],
    );
  }

  async create(params: {
    sectionId: number;
    title: string;
    lessonType: LessonType;
    content?: string | null;
    videoUrl?: string | null;
    durationMinutes?: number | null;
    sortOrder: number;
    isPreview?: boolean;
  }): Promise<LessonRow> {
    const row = await this.queryOne<LessonRow>(
      pgPool,
      `INSERT INTO lessons
        (section_id, title, lesson_type, content, video_url, duration_minutes, sort_order, is_preview)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        params.sectionId,
        params.title,
        params.lessonType,
        params.content ?? null,
        params.videoUrl ?? null,
        params.durationMinutes ?? null,
        params.sortOrder,
        params.isPreview ?? false,
      ],
    );
    if (!row) this.notFound('Failed to create lesson');
    return row;
  }

  async update(lessonId: number, sectionId: number, patch: {
    title?: string;
    content?: string | null;
    videoUrl?: string | null;
    durationMinutes?: number | null;
    isPreview?: boolean;
  }): Promise<LessonRow> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    const add = (col: string, val: unknown) => {
      sets.push(`${col} = $${i++}`);
      values.push(val);
    };

    if (patch.title !== undefined) add('title', patch.title);
    if (patch.content !== undefined) add('content', patch.content);
    if (patch.videoUrl !== undefined) add('video_url', patch.videoUrl);
    if (patch.durationMinutes !== undefined) add('duration_minutes', patch.durationMinutes);
    if (patch.isPreview !== undefined) add('is_preview', patch.isPreview);

    if (sets.length === 0) {
      const row = await this.queryOne<LessonRow>(pgPool, `SELECT * FROM lessons WHERE lesson_id = $1 AND section_id = $2`, [lessonId, sectionId]);
      if (!row) this.notFound('Lesson not found');
      return row;
    }

    values.push(lessonId, sectionId);
    const row = await this.queryOne<LessonRow>(
      pgPool,
      `UPDATE lessons
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE lesson_id = $${i++} AND section_id = $${i}
       RETURNING *`,
      values,
    );
    if (!row) this.notFound('Lesson not found');
    return row;
  }

  async getMaxSortOrder(sectionId: number): Promise<number> {
    const row = await this.queryOne<{ max_order: number | null }>(
      pgPool,
      `SELECT MAX(sort_order)::int AS max_order FROM lessons WHERE section_id = $1`,
      [sectionId],
    );
    return row?.max_order ?? 0;
  }
}

