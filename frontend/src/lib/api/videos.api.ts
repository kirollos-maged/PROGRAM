import { apiClient } from "./axios";

export const videosApi = {
  getProgress: async (lessonId: string | number) => {
    const { data } = await apiClient.get(`/videos/lessons/${lessonId}/progress`);
    return data;
  },
  updateProgress: async (lessonId: string | number, payload: { watchedSeconds: number; totalSeconds?: number }) => {
    const { data } = await apiClient.post(`/videos/lessons/${lessonId}/progress`, payload);
    return data;
  },
  listBookmarks: async (lessonId: string | number) => {
    const { data } = await apiClient.get<{ items: Array<{ video_bookmark_id: number; position_seconds: number; note: string | null }> }>(`/videos/lessons/${lessonId}/bookmarks`);
    return data;
  },
  addBookmark: async (lessonId: string | number, payload: { positionSeconds: number; note?: string }) => {
    const { data } = await apiClient.post(`/videos/lessons/${lessonId}/bookmarks`, payload);
    return data;
  },
  deleteBookmark: async (videoBookmarkId: string | number) => {
    const { data } = await apiClient.delete(`/videos/bookmarks/${videoBookmarkId}`);
    return data;
  },
};
