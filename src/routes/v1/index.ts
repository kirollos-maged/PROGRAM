import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import videoRoutes from './video.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import quizRoutes from './quiz.routes';
import assignmentRoutes from './assignment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/videos', videoRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);

export default router;

