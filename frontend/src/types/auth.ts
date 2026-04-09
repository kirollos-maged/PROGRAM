export type UserRole = "student" | "instructor" | "admin";

export interface User {
  userId: number;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  user: User;
  emailVerificationToken?: string;
}
