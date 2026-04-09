import { apiClient } from "./axios";

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalActivityEvents: number;
}

export interface AdminUser {
  user_id: number;
  email: string;
  role: "student" | "instructor" | "admin";
  is_email_verified: boolean;
  created_at: string;
}

export interface AdminCourse {
  course_id: number;
  title: string;
  status: string;
  level: string | null;
  price: string;
  instructor_email: string;
  created_at: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
}

export interface SecurityEvent {
  event_type: string;
  created_at: string;
  metadata?: unknown;
}

export const adminApi = {
  getStats: async () => {
    const { data } = await apiClient.get<AdminStats>("/admin/stats");
    return data;
  },
  getUsers: async (limit = 50, offset = 0) => {
    const { data } = await apiClient.get<{ items: AdminUser[]; total: number }>("/admin/users", {
      params: { limit, offset },
    });
    return data;
  },
  getCourses: async (limit = 50, offset = 0) => {
    const { data } = await apiClient.get<{ items: AdminCourse[]; total: number }>("/admin/courses", {
      params: { limit, offset },
    });
    return data;
  },
  getFeatureFlags: async () => {
    const { data } = await apiClient.get<{ items: FeatureFlag[]; total: number }>("/admin/feature-flags");
    return data;
  },
  securityEvents: async () => {
    const { data } = await apiClient.get<{ items: SecurityEvent[]; total: number }>("/admin/security-events");
    return data;
  },
  upsertFeatureFlag: async (payload: FeatureFlag) => {
    const { data } = await apiClient.post<FeatureFlag>("/admin/feature-flags", payload);
    return data;
  },
};
