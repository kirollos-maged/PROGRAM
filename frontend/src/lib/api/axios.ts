import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const baseURL = rawBaseURL.endsWith("/api/v1")
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/$/, "")}/api/v1`;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token?: string) => {
  queue.forEach((request) => {
    if (error) request.reject(error);
    else if (token) request.resolve(token);
  });
  queue = [];
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, undefined, {
          withCredentials: true,
        });
        const newAccessToken = response.data.accessToken as string;

        useAuthStore.setState({ accessToken: newAccessToken });
        processQueue(null, newAccessToken);
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const data = error.response?.data;
    let message = "Unexpected API error";
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string") message = d.message;
      else if (d.error === "VALIDATION_ERROR" && Array.isArray(d.details)) {
        const first = d.details[0] as { message?: string } | undefined;
        message = first?.message ?? "Validation failed";
      } else if (typeof d.error === "string") {
        message = d.error.replace(/_/g, " ");
      }
    } else if (error.message === "Network Error") {
      message = "Cannot reach API. Is the backend running (and NEXT_PUBLIC_API_URL correct)?";
    }
    return Promise.reject(new Error(message));
  }
);

