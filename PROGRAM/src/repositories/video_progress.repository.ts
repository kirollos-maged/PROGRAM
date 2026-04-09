import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type VideoWatchProgressRow = {
  progress_id: number;
  student_id: number;
  lesson_id: number;
  watched_seconds: number;
  total_seconds: number | null;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
};

export class VideoProgressRepository extends BaseRepository {
  async get(studentId: number, lessonId: number): Promise<VideoWatchProgressRow | null> {
    return this.queryOne<VideoWatchProgressRow>(
      pgPool,
      `SELECT *
       FROM video_watch_progress
       WHERE student_id = $1 AND lesson_id = $2`,
      [studentId, lessonId],
    );
  }

  async upsert(params: { studentId: number; lessonId: number; watchedSeconds: number; totalSeconds?: number | null }) {
    const row = await this.queryOne<VideoWatchProgressRow>(
      pgPool,
      `INSERT INTO video_watch_progress (student_id, lesson_id, watched_seconds, total_seconds, last_watched_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (student_id, lesson_id)
       DO UPDATE SET
         watched_seconds = EXCLUDED.watched_seconds,
         total_seconds = COALESCE(EXCLUDED.total_seconds, video_watch_progress.total_seconds),
         last_watched_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [params.studentId, params.lessonId, params.watchedSeconds, params.totalSeconds ?? null],
    );
    if (!row) this.notFound('Failed to update progress');
    return row;
  }
}

