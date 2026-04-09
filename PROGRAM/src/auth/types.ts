import type { Role } from './roles';

export type AuthenticatedUser = {
  id: number;
  role: Role;
};

