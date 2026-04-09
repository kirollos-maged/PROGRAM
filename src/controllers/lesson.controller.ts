import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../services/lesson.service';

const lessonService = new LessonService();

export class LessonController {
  static async getLessonById(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      res.json({ lessonId });
    } catch (err) {
      next(err);
    }
  }

  static async completeLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const user = (req as any).user;
      res.status(201).json({ lessonId, userId: user.id, status: 'completed' });
    } catch (err) {
      next(err);
    }
  }

  static async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const user = (req as any).user;
      res.status(200).json({ lessonId, userId: user.id, bookmarked: true });
    } catch (err) {
      next(err);
    }
  }

  static async listLessonsBySection(req: Request, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const result = await lessonService.listBySection(Number(sectionId));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { sectionId } = req.params;
      const { title, lessonType, content, videoUrl, durationMinutes, isPreview } = req.body;
      const lesson = await lessonService.create({
        userId: user.id,
        sectionId: Number(sectionId),
        title,
        lessonType,
        content,
        videoUrl,
        durationMinutes,
        isPreview,
      });
      res.status(201).json(lesson);
    } catch (err) {
      next(err);
    }
  }

  static async updateLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { sectionId, lessonId } = req.params;
      const patch = req.body;
      const lesson = await lessonService.update({
        userId: user.id,
        sectionId: Number(sectionId),
        lessonId: Number(lessonId),
        patch,
      });
      res.json(lesson);
    } catch (err) {
      next(err);
    }
  }

  static async reorderLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { sectionId } = req.params;
      const { lessonIds } = req.body as { lessonIds: number[] };
      await lessonService.reorder({ userId: user.id, sectionId: Number(sectionId), lessonIds });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

