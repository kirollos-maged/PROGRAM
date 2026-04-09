import type { Request, Response, NextFunction } from 'express';
import type { Permission } from '../auth/permissions';
import { hasPermission } from '../auth/permissions';
import { isRoleAtLeast, type Role } from '../auth/roles';

function getUserRole(req: Request): Role | null {
  const user = (req as any).user as { role?: Role } | undefined;
  return user?.role ?? null;
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = getUserRole(req);
    if (!role) return res.status(401).json({ error: 'UNAUTHORIZED' });
    if (!hasPermission(role, permission)) return res.status(403).json({ error: 'FORBIDDEN' });
    return next();
  };
}

export function requireMinRole(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = getUserRole(req);
    if (!role) return res.status(401).json({ error: 'UNAUTHORIZED' });
    if (!isRoleAtLeast(role, minRole)) return res.status(403).json({ error: 'FORBIDDEN' });
    return next();
  };
}

