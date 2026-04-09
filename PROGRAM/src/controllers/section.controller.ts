import { Request, Response, NextFunction } from 'express';
import { SectionService } from '../services/section.service';

const sectionService = new SectionService();

export class SectionController {
  static async listSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const result = await sectionService.list(Number(courseId));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { courseId } = req.params;
      const { title } = req.body;
      const section = await sectionService.create({ userId: user.id, courseId: Number(courseId), title });
      res.status(201).json(section);
    } catch (err) {
      next(err);
    }
  }

  static async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { courseId, sectionId } = req.params;
      const { title } = req.body;
      const section = await sectionService.update({
        userId: user.id,
        courseId: Number(courseId),
        sectionId: Number(sectionId),
        title,
      });
      res.json(section);
    } catch (err) {
      next(err);
    }
  }

  static async reorderSections(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { courseId } = req.params;
      const { sectionIds } = req.body as { sectionIds: number[] };
      await sectionService.reorder({ userId: user.id, courseId: Number(courseId), sectionIds });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

