import { RepositoryError } from '../repositories/errors';
import { StudentRepository } from '../repositories/student.repository';
import { VideoProgressRepository } from '../repositories/video_progress.repository';
import { VideoCaptionRepository } from '../repositories/video_caption.repository';
import { VideoBookmarkRepository } from '../repositories/video_bookmark.repository';

export class VideoLearningService {
  private students = new StudentRepository();
  private progress = new VideoProgressRepository();
  private captions = new VideoCaptionRepository();
  private bookmarks = new VideoBookmarkRepository();

  private async requireStudentId(userId: number): Promise<number> {
    const studentId = await this.students.findStudentIdByUserId(userId);
    if (!studentId) throw new RepositoryError('forbidden', 'Student access required', 403);
    return studentId;
  }

  async getProgress(params: { userId: number; lessonId: number }) {
    const studentId = await this.requireStudentId(params.userId);
    const row = await this.progress.get(studentId, params.lessonId);
    return row ?? { student_id: studentId, lesson_id: params.lessonId, watched_seconds: 0, total_seconds: null };
  }

  async updateProgress(params: { userId: number; lessonId: number; watchedSeconds: number; totalSeconds?: number | null }) {
    const studentId = await this.requireStudentId(params.userId);
    return this.progress.upsert({
      studentId,
      lessonId: params.lessonId,
      watchedSeconds: params.watchedSeconds,
      totalSeconds: params.totalSeconds ?? null,
    });
  }

  async listCaptions(lessonId: number) {
    const items = await this.captions.listByLesson(lessonId);
    return { items, total: items.length };
  }

  async addCaption(params: { lessonId: number; languageCode: string; captionUrl: string }) {
    return this.captions.create(params);
  }

  async listBookmarks(params: { userId: number; lessonId: number }) {
    const studentId = await this.requireStudentId(params.userId);
    const items = await this.bookmarks.listByLesson(studentId, params.lessonId);
    return { items, total: items.length };
  }

  async addBookmark(params: { userId: number; lessonId: number; positionSeconds: number; note?: string }) {
    const studentId = await this.requireStudentId(params.userId);
    return this.bookmarks.create({
      studentId,
      lessonId: params.lessonId,
      positionSeconds: params.positionSeconds,
      note: params.note ?? null,
    });
  }

  async deleteBookmark(params: { userId: number; videoBookmarkId: number }) {
    const studentId = await this.requireStudentId(params.userId);
    await this.bookmarks.deleteOwned(params.videoBookmarkId, studentId);
  }
}

