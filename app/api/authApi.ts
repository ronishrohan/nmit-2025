import { API_CONFIG, apiCall } from "../lib/api";

export const authApi = {
  signup: async (data: { loginId: string; pwd: string; name?: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  login: async (data: { loginId: string; pwd: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
