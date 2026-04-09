import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { validate } from '../../middleware/validation.middleware';
import { QuizController } from '../../controllers/quiz.controller';
import { addAnswerSchema, addQuestionSchema, createQuizSchema, submitAttemptSchema } from '../../validation/quiz.schema';

const router = Router();

// Instructor/admin quiz management
router.post('/', authMiddleware, requirePermission('quiz:create'), validate(createQuizSchema), QuizController.createQuiz);
router.post('/:quizId/questions', authMiddleware, requirePermission('quiz:update'), validate(addQuestionSchema), QuizController.addQuestion);
router.post('/questions/:questionId/answers', authMiddleware, requirePermission('quiz:update'), validate(addAnswerSchema), QuizController.addAnswer);

// Student attempts
router.post('/:quizId/attempts', authMiddleware, requirePermission('quiz:attempt:start'), QuizController.startAttempt);
router.post('/attempts/:attemptId/submit', authMiddleware, requirePermission('quiz:attempt:submit'), validate(submitAttemptSchema), QuizController.submitAttempt);

export default router;

