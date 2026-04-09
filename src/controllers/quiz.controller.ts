import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service';

const quizService = new QuizService();

export class QuizController {
  static async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { courseId, title, description, timeLimitMinutes, maxAttempts, isRandomized } = req.body;
      const quiz = await quizService.createQuiz({
        userId: user.id,
        courseId,
        title,
        description,
        timeLimitMinutes,
        maxAttempts,
        isRandomized,
      });
      res.status(201).json(quiz);
    } catch (err) {
      next(err);
    }
  }

  static async addQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { quizId } = req.params;
      const { questionText, questionType, points } = req.body;
      const question = await quizService.addQuestion({
        userId: user.id,
        quizId: Number(quizId),
        questionText,
        questionType,
        points,
      });
      res.status(201).json(question);
    } catch (err) {
      next(err);
    }
  }

  static async addAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { questionId } = req.params;
      const { answerText, isCorrect } = req.body;
      const answer = await quizService.addAnswer({
        userId: user.id,
        questionId: Number(questionId),
        answerText,
        isCorrect,
      });
      res.status(201).json(answer);
    } catch (err) {
      next(err);
    }
  }

  static async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { quizId } = req.params;
      const result = await quizService.startAttempt({ userId: user.id, quizId: Number(quizId) });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user as { id: number };
      const { attemptId } = req.params;
      const { answers } = req.body;
      const result = await quizService.submitAttempt({ userId: user.id, attemptId: Number(attemptId), answers });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

