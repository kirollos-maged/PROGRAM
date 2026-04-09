import { apiClient } from "./axios";

export const assignmentsApi = {
  mySubmissions: async (assignmentId: string | number) => {
    const { data } = await apiClient.get(`/assignments/${assignmentId}/submissions/me`);
    return data;
  },
  submit: async (assignmentId: string | number, payload: { content?: string; file?: File }) => {
    const form = new FormData();
    if (payload.content) form.append("content", payload.content);
    if (payload.file) form.append("file", payload.file);
    const { data } = await apiClient.post(`/assignments/${assignmentId}/submissions`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
