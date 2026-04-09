import { apiClient } from "./axios";

export const paymentsApi = {
  checkout: async (payload: { courseId: number; provider?: string }) => {
    const { data } = await apiClient.post("/payments/checkout", payload);
    return data;
  },
  refund: async (paymentId: number | string) => {
    const { data } = await apiClient.post(`/payments/${paymentId}/refund`);
    return data;
  },
};
