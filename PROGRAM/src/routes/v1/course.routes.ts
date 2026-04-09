import { Router } from 'express';
import { CourseController } from '../../controllers/course.controller';
import { SectionController } from '../../controllers/section.controller';
import { LessonController } from '../../controllers/lesson.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createCourseSchema, updateCourseSchema } from '../../validation/course.schema';
import { createSectionSchema, reorderSectionsSchema, updateSectionSchema } from '../../validation/section.schema';
import { createLessonSchema, reorderLessonsSchema, updateLessonSchema } from '../../validation/lesson.schema';

const router = Router();

router.get('/', CourseController.listCourses);
router.get('/:courseId', CourseController.getCourseById);
router.post('/:courseId/enroll', authMiddleware, CourseController.enrollInCourse);

router.post(
  '/',
  authMiddleware,
  requirePermission('course:create'),
  validate(createCourseSchema),
  CourseController.createCourse,
);

router.patch(
  '/:courseId',
  authMiddleware,
  requirePermission('course:update'),
  validate(updateCourseSchema),
  CourseController.updateCourse,
);

router.post(
  '/:courseId/publish',
  authMiddleware,
  requirePermission('course:publish'),
  CourseController.publishCourse,
);

// Sections (course structure)
router.get('/:courseId/sections', SectionController.listSections);
router.post(
  '/:courseId/sections',
  authMiddleware,
  requirePermission('section:create'),
  validate(createSectionSchema),
  SectionController.createSection,
);
router.patch(
  '/:courseId/sections/:sectionId',
  authMiddleware,
  requirePermission('section:update'),
  validate(updateSectionSchema),
  SectionController.updateSection,
);
router.post(
  '/:courseId/sections/reorder',
  authMiddleware,
  requirePermission('section:reorder'),
  validate(reorderSectionsSchema),
  SectionController.reorderSections,
);

// Lessons (within a section)
router.get('/:courseId/sections/:sectionId/lessons', LessonController.listLessonsBySection);
router.post(
  '/:courseId/sections/:sectionId/lessons',
  authMiddleware,
  requirePermission('lesson:create'),
  validate(createLessonSchema),
  LessonController.createLesson,
);
router.patch(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authMiddleware,
  requirePermission('lesson:update'),
  validate(updateLessonSchema),
  LessonController.updateLesson,
);
router.post(
  '/:courseId/sections/:sectionId/lessons/reorder',
  authMiddleware,
  requirePermission('lesson:reorder'),
  validate(reorderLessonsSchema),
  LessonController.reorderLessons,
);

export default router;

