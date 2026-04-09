import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type VideoCaptionRow = {
  caption_id: number;
  lesson_id: number;
  language_code: string | null;
  caption_url: string | null;
  created_at: string;
};

export class VideoCaptionRepository extends BaseRepository {
  async listByLesson(lessonId: number): Promise<VideoCaptionRow[]> {
    return this.queryMany<VideoCaptionRow>(
      pgPool,
      `SELECT * FROM video_captions WHERE lesson_id = $1 ORDER BY created_at DESC`,
      [lessonId],
    );
  }

  async create(params: { lessonId: number; languageCode: string; captionUrl: string }): Promise<VideoCaptionRow> {
    const row = await this.queryOne<VideoCaptionRow>(
      pgPool,
      `INSERT INTO video_captions (lesson_id, language_code, caption_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.lessonId, params.languageCode, params.captionUrl],
    );
    if (!row) this.notFound('Failed to create caption');
    return row;
  }
}

