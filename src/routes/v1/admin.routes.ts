import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireMinRole, requirePermission } from '../../middleware/permission.middleware';

const router = Router();

router.get('/stats', authMiddleware, requireMinRole('admin'), AdminController.getStats);
router.get('/users', authMiddleware, requireMinRole('admin'), AdminController.listUsers);
router.get('/courses', authMiddleware, requireMinRole('admin'), AdminController.listCourses);
router.get('/feature-flags', authMiddleware, requireMinRole('admin'), AdminController.listFeatureFlags);
router.get(
  '/security-events',
  authMiddleware,
  requirePermission('admin:security_events:read'),
  AdminController.listSecurityEvents,
);

router.post(
  '/feature-flags',
  authMiddleware,
  requirePermission('admin:feature_flags:write'),
  AdminController.upsertFeatureFlag,
);

export default router;

