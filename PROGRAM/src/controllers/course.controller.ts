import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';

const courseService = new CourseService();

export class CourseController {
  static async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;
      const result = await courseService.listPublished({ limit, offset });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const result = await courseService.getById(Number(courseId));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async enrollInCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const user = (req as any).user;
      res.status(201).json({ courseId, userId: user.id });
    } catch (err) {
      next(err);
    }
  }

  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { title, description, price, categoryId, level, thumbnailUrl } = req.body;

      const course = await courseService.createDraft({
        userId: user.id,
        title,
        description,
        price,
        categoryId,
        level,
        thumbnailUrl,
      });

      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  }

  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { courseId } = req.params;
      const patch = req.body;
      const course = await courseService.updateDraft({
        courseId: Number(courseId),
        userId: user.id,
        patch,
      });
      res.json(course);
    } catch (err) {
      next(err);
    }
  }

  static async publishCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { courseId } = req.params;
      const course = await courseService.publish({ courseId: Number(courseId), userId: user.id });
      res.json(course);
    } catch (err) {
      next(err);
    }
  }
}

