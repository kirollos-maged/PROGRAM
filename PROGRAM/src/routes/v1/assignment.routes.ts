import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { validate } from '../../middleware/validation.middleware';
import { upload } from '../../middleware/upload.middleware';
import { AssignmentController } from '../../controllers/assignment.controller';
import { gradeSubmissionSchema, submitAssignmentSchema } from '../../validation/assignment.schema';

const router = Router();

// Student submissions
router.post(
  '/:assignmentId/submissions',
  authMiddleware,
  requirePermission('assignment:submit'),
  upload.single('file'),
  validate(submitAssignmentSchema),
  AssignmentController.submit,
);

router.get(
  '/:assignmentId/submissions/me',
  authMiddleware,
  requirePermission('assignment:submit'),
  AssignmentController.mySubmissions,
);

// Instructor grading
router.patch(
  '/submissions/:submissionId/grade',
  authMiddleware,
  requirePermission('assignment:grade'),
  validate(gradeSubmissionSchema),
  AssignmentController.grade,
);

export default router;

