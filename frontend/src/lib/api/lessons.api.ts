import { apiClient } from "./axios";

export const lessonsApi = {
  details: async (lessonId: string | number) => {
    const { data } = await apiClient.get(`/lessons/${lessonId}`);
    return data;
  },
  complete: async (lessonId: string | number) => {
    const { data } = await apiClient.post(`/lessons/${lessonId}/complete`);
    return data;
  },
  bookmarkToggle: async (lessonId: string | number) => {
    const { data } = await apiClient.post(`/lessons/${lessonId}/bookmark`);
    return data;
  },
};
