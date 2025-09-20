import { apiCall } from "../lib/api";

export const woApi = {
  getAll: async () => apiCall("/fetch/workorders"),
  getById: async (id: number) => apiCall(`/fetch/workorders/${id}`),
  search: async (q: string) =>
    apiCall(`/fetch/workorders?q=${encodeURIComponent(q)}`),
  create: async (data: any) =>
    apiCall("/wo/new", { method: "POST", body: JSON.stringify(data) }),
};
