import { API_CONFIG, apiCall } from "../lib/api";

export const fetchApi = {
  getTables: async () => apiCall(API_CONFIG.ENDPOINTS.FETCH.TABLES),
  getAll: async () => apiCall(API_CONFIG.ENDPOINTS.FETCH.ALL),
  getTable: async (tableName: string) => apiCall(`${API_CONFIG.ENDPOINTS.FETCH.TABLE}/${tableName}`),
};
