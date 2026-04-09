export const roles = ['student', 'instructor', 'admin'] as const;
export type Role = (typeof roles)[number];

// Higher number => more privileges
export const roleRank: Record<Role, number> = {
  student: 1,
  instructor: 2,
  admin: 3,
};

export function isRoleAtLeast(userRole: Role, minimumRole: Role): boolean {
  return roleRank[userRole] >= roleRank[minimumRole];
}

