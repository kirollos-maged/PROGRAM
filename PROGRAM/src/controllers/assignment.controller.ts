import { Request, Response, NextFunction } from 'express';
import { AssignmentSubmissionService } from '../services/assignment_submission.service';

const assignmentSubmissionService = new AssignmentSubmissionService();

export class AssignmentController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { assignmentId } = req.params;
      const { content } = req.body;
      const file = (req as any).file as Express.Multer.File | undefined;
      const fileUrl = file ? `/uploads/${file.filename}` : null;

      const submission = await assignmentSubmissionService.submit({
        userId: user.id,
        assignmentId: Number(assignmentId),
        content,
        fileUrl,
      });

      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  }

  static async mySubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { assignmentId } = req.params;
      const result = await assignmentSubmissionService.mySubmissions({
        userId: user.id,
        assignmentId: Number(assignmentId),
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async grade(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { submissionId } = req.params;
      const { score, feedback } = req.body;
      const updated = await assignmentSubmissionService.grade({
        userId: user.id,
        submissionId: Number(submissionId),
        score,
        feedback,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

