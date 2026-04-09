import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type VideoBookmarkRow = {
  video_bookmark_id: number;
  student_id: number;
  lesson_id: number;
  position_seconds: number;
  note: string | null;
  created_at: string;
};

export class VideoBookmarkRepository extends BaseRepository {
  async listByLesson(studentId: number, lessonId: number): Promise<VideoBookmarkRow[]> {
    return this.queryMany<VideoBookmarkRow>(
      pgPool,
      `SELECT *
       FROM video_bookmarks
       WHERE student_id = $1 AND lesson_id = $2
       ORDER BY created_at DESC`,
      [studentId, lessonId],
    );
  }

  async create(params: { studentId: number; lessonId: number; positionSeconds: number; note?: string | null }): Promise<VideoBookmarkRow> {
    const row = await this.queryOne<VideoBookmarkRow>(
      pgPool,
      `INSERT INTO video_bookmarks (student_id, lesson_id, position_seconds, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [params.studentId, params.lessonId, params.positionSeconds, params.note ?? null],
    );
    if (!row) this.notFound('Failed to create bookmark');
    return row;
  }

  async deleteOwned(videoBookmarkId: number, studentId: number): Promise<void> {
    const row = await this.queryOne<{ video_bookmark_id: number }>(
      pgPool,
      `DELETE FROM video_bookmarks
       WHERE video_bookmark_id = $1 AND student_id = $2
       RETURNING video_bookmark_id`,
      [videoBookmarkId, studentId],
    );
    if (!row) this.notFound('Bookmark not found');
  }
}

