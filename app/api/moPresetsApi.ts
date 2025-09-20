import { API_CONFIG, apiCall } from "../lib/api";

export const moPresetsApi = {
  getAll: async () => apiCall(API_CONFIG.ENDPOINTS.MO_PRESETS.GET_ALL),
  getById: async (id: number) => apiCall(`${API_CONFIG.ENDPOINTS.MO_PRESETS.GET_BY_ID}/${id}`),
  create: async (data: { name: string; description?: string; quantity: number; productId: number }) =>
    apiCall(API_CONFIG.ENDPOINTS.MO_PRESETS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (
    id: number,
    data: { name?: string; description?: string; quantity?: number; productId?: number },
  ) =>
    apiCall(`${API_CONFIG.ENDPOINTS.MO_PRESETS.UPDATE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: number) =>
    apiCall(`${API_CONFIG.ENDPOINTS.MO_PRESETS.DELETE}/${id}`, {
      method: "DELETE",
    }),
};
