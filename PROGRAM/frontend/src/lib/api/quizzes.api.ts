import { apiClient } from "./axios";

export const quizzesApi = {
  startAttempt: async (quizId: string | number) => {
    const { data } = await apiClient.post(`/quizzes/${quizId}/attempts`);
    return data;
  },
  submitAttempt: async (attemptId: string | number, payload: { answers: Array<{ questionId: number; answerId?: number; answerText?: string }> }) => {
    const { data } = await apiClient.post(`/quizzes/attempts/${attemptId}/submit`, payload);
    return data;
  },
};
