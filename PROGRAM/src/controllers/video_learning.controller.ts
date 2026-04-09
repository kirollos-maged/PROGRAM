import { Request, Response, NextFunction } from 'express';
import { VideoLearningService } from '../services/video_learning.service';

const videoLearningService = new VideoLearningService();

export class VideoLearningController {
  static async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { lessonId } = req.params;
      const result = await videoLearningService.getProgress({ userId: user.id, lessonId: Number(lessonId) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { lessonId } = req.params;
      const { watchedSeconds, totalSeconds } = req.body;
      const result = await videoLearningService.updateProgress({
        userId: user.id,
        lessonId: Number(lessonId),
        watchedSeconds,
        totalSeconds,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async listCaptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const result = await videoLearningService.listCaptions(Number(lessonId));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async addCaption(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const { languageCode, captionUrl } = req.body;
      const caption = await videoLearningService.addCaption({
        lessonId: Number(lessonId),
        languageCode,
        captionUrl,
      });
      res.status(201).json(caption);
    } catch (err) {
      next(err);
    }
  }

  static async listBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { lessonId } = req.params;
      const result = await videoLearningService.listBookmarks({ userId: user.id, lessonId: Number(lessonId) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async addBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { lessonId } = req.params;
      const { positionSeconds, note } = req.body;
      const bookmark = await videoLearningService.addBookmark({
        userId: user.id,
        lessonId: Number(lessonId),
        positionSeconds,
        note,
      });
      res.status(201).json(bookmark);
    } catch (err) {
      next(err);
    }
  }

  static async deleteBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { videoBookmarkId } = req.params;
      await videoLearningService.deleteBookmark({ userId: user.id, videoBookmarkId: Number(videoBookmarkId) });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

