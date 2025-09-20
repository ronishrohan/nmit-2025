import { API_CONFIG, apiCall } from "../lib/api";

export const profileApi = {
  get: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.PROFILE.GET);
  },
  update: async (data: { name?: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
