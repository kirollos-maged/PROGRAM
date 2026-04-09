import { Request, Response, NextFunction } from 'express';
import type { Role } from '../auth/roles';
import { isRoleAtLeast } from '../auth/roles';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: Role } | undefined;
    if (!user?.role) return res.status(401).json({ error: 'UNAUTHORIZED' });
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'FORBIDDEN' });
    return next();
  };
}

export function requireAtLeastRole(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: Role } | undefined;
    if (!user?.role) return res.status(401).json({ error: 'UNAUTHORIZED' });
    if (!isRoleAtLeast(user.role, minRole)) return res.status(403).json({ error: 'FORBIDDEN' });
    return next();
  };
}

