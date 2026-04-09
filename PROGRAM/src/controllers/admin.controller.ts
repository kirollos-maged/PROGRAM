import { Request, Response, NextFunction } from 'express';
import { getSecurityEvents } from '../repositories/activityLog.repository';
import { upsertFeatureFlag } from '../repositories/featureFlag.repository';
import { getAdminStats, listAdminUsers, listAdminCourses, getAdminFeatureFlags } from '../repositories/admin.repository';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await getAdminStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const users = await listAdminUsers(limit, offset);
      res.json({ items: users, total: users.length });
    } catch (err) {
      next(err);
    }
  }

  static async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const courses = await listAdminCourses(limit, offset);
      res.json({ items: courses, total: courses.length });
    } catch (err) {
      next(err);
    }
  }

  static async listFeatureFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const flags = await getAdminFeatureFlags();
      res.json({ items: flags, total: flags.length });
    } catch (err) {
      next(err);
    }
  }

  static async listSecurityEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await getSecurityEvents(20);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  }

  static async upsertFeatureFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, enabled, description } = req.body;
      if (!key || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Feature flag key and enabled state are required.' });
      }

      const flag = await upsertFeatureFlag({ key, enabled, description });
      res.status(200).json(flag);
    } catch (err) {
      next(err);
    }
  }
}

