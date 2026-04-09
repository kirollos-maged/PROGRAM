import { apiClient } from "./axios";
import type { LoginResponse, RegisterResponse } from "@/types/auth";

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
    return data;
  },
  forgotPassword: async (payload: { email: string }) => {
    const { data } = await apiClient.post<{ ok: boolean; passwordResetToken?: string }>("/auth/password-reset/request", payload);
    return data;
  },
  resetPassword: async (payload: { token: string; newPassword: string }) => {
    const { data } = await apiClient.post<{ ok: boolean }>("/auth/password-reset/confirm", payload);
    return data;
  },
  verifyEmail: async (payload: { token: string }) => {
    const { data } = await apiClient.post<{ verified: boolean }>("/auth/verify-email", payload);
    return data;
  },
  logout: async () => apiClient.post("/auth/logout"),
  logoutAll: async () => apiClient.post("/auth/logout-all"),
};
