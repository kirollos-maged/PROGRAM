import { Router } from 'express';
import { VideoController } from '../../controllers/video.controller';
import { VideoLearningController } from '../../controllers/video_learning.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { validate } from '../../middleware/validation.middleware';
import { addCaptionSchema, addVideoBookmarkSchema, updateProgressSchema } from '../../validation/video_learning.schema';

const router = Router();

router.post('/sessions', authMiddleware, VideoController.startSession);
router.post('/sessions/:sessionId/progress', authMiddleware, VideoController.updateProgress);
router.get('/sessions/:sessionId/stream', authMiddleware, VideoController.getSignedStreamUrl);

// Video learning (progress/resume/captions/bookmarks)
router.get(
  '/lessons/:lessonId/progress',
  authMiddleware,
  requirePermission('video:progress:read'),
  VideoLearningController.getProgress,
);
router.post(
  '/lessons/:lessonId/progress',
  authMiddleware,
  requirePermission('video:progress:write'),
  validate(updateProgressSchema),
  VideoLearningController.updateProgress,
);

router.get(
  '/lessons/:lessonId/captions',
  authMiddleware,
  requirePermission('video:captions:read'),
  VideoLearningController.listCaptions,
);
router.post(
  '/lessons/:lessonId/captions',
  authMiddleware,
  requirePermission('video:captions:write'),
  validate(addCaptionSchema),
  VideoLearningController.addCaption,
);

router.get(
  '/lessons/:lessonId/bookmarks',
  authMiddleware,
  requirePermission('video:bookmark:read'),
  VideoLearningController.listBookmarks,
);
router.post(
  '/lessons/:lessonId/bookmarks',
  authMiddleware,
  requirePermission('video:bookmark:write'),
  validate(addVideoBookmarkSchema),
  VideoLearningController.addBookmark,
);
router.delete(
  '/bookmarks/:videoBookmarkId',
  authMiddleware,
  requirePermission('video:bookmark:delete'),
  VideoLearningController.deleteBookmark,
);

export default router;

