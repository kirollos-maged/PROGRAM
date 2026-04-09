import type { Role } from './roles';
import { isRoleAtLeast } from './roles';

export type Permission =
  | 'admin:security_events:read'
  | 'admin:feature_flags:write'
  | 'course:enroll'
  | 'course:create'
  | 'course:update'
  | 'course:publish'
  | 'section:create'
  | 'section:update'
  | 'section:reorder'
  | 'lesson:create'
  | 'lesson:update'
  | 'lesson:reorder'
  | 'lesson:read'
  | 'lesson:complete'
  | 'video:progress:read'
  | 'video:progress:write'
  | 'video:bookmark:read'
  | 'video:bookmark:write'
  | 'video:bookmark:delete'
  | 'video:captions:read'
  | 'video:captions:write'
  | 'video:session:start'
  | 'quiz:create'
  | 'quiz:update'
  | 'quiz:attempt:start'
  | 'quiz:attempt:submit'
  | 'assignment:submit'
  | 'assignment:grade'
  | 'payment:checkout'
  | 'payment:refund:request';

// Baseline permissions per role. Admin implicitly gets all.
const rolePermissions: Record<Role, ReadonlySet<Permission>> = {
  student: new Set<Permission>([
    'course:enroll',
    'lesson:read',
    'lesson:complete',
    'video:progress:read',
    'video:progress:write',
    'video:bookmark:read',
    'video:bookmark:write',
    'video:bookmark:delete',
    'video:captions:read',
    'video:session:start',
    'quiz:attempt:start',
    'quiz:attempt:submit',
    'assignment:submit',
    'payment:checkout',
    'payment:refund:request',
  ]),
  instructor: new Set<Permission>([
    'course:enroll',
    'course:create',
    'course:update',
    'course:publish',
    'section:create',
    'section:update',
    'section:reorder',
    'lesson:create',
    'lesson:update',
    'lesson:reorder',
    'lesson:read',
    'lesson:complete',
    'video:progress:read',
    'video:progress:write',
    'video:bookmark:read',
    'video:bookmark:write',
    'video:bookmark:delete',
    'video:captions:read',
    'video:captions:write',
    'video:session:start',
    'quiz:create',
    'quiz:update',
    'assignment:grade',
    'payment:checkout',
    'payment:refund:request',
  ]),
  admin: new Set<Permission>([
    'admin:security_events:read',
    'admin:feature_flags:write',
    'course:enroll',
    'course:create',
    'course:update',
    'course:publish',
    'section:create',
    'section:update',
    'section:reorder',
    'lesson:create',
    'lesson:update',
    'lesson:reorder',
    'lesson:read',
    'lesson:complete',
    'video:progress:read',
    'video:progress:write',
    'video:bookmark:read',
    'video:bookmark:write',
    'video:bookmark:delete',
    'video:captions:read',
    'video:captions:write',
    'video:session:start',
    'quiz:create',
    'quiz:update',
    'quiz:attempt:start',
    'quiz:attempt:submit',
    'assignment:submit',
    'assignment:grade',
    'payment:checkout',
    'payment:refund:request',
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  if (isRoleAtLeast(role, 'admin')) return true;
  return rolePermissions[role].has(permission);
}

