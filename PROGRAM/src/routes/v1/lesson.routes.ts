import { Router } from 'express';
import { LessonController } from '../../controllers/lesson.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:lessonId', authMiddleware, LessonController.getLessonById);
router.post('/:lessonId/complete', authMiddleware, LessonController.completeLesson);
router.post('/:lessonId/bookmark', authMiddleware, LessonController.toggleBookmark);

export default router;

