"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/auth";

function setCookie(name: string, value: string, options?: { path?: string; maxAge?: number; sameSite?: "Strict" | "Lax" | "None" }) {
  if (typeof document === "undefined") return;
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  if (options?.path) parts.push(`Path=${options.path}`);
  if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
  document.cookie = parts.join("; ");
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth({ accessToken: data.accessToken, refreshToken: null, user: data.user });
      setCookie("accessToken", data.accessToken, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "Strict" });
      setCookie("role", data.user.role, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "Strict" });
    },
  });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}
