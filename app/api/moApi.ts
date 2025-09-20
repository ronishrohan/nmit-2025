import { apiCall } from "../lib/api";

export const moApi = {
  getAll: async () => apiCall("/fetch/manufacturingorders"),
  getById: async (id: number) => apiCall(`/fetch/manufacturingorders/${id}`),
  search: async (q: string) =>
    apiCall(`/fetch/manufacturingorders?q=${encodeURIComponent(q)}`),
  create: async (data: any) =>
    apiCall("/mo/new", { method: "POST", body: JSON.stringify(data) }),
  saveDraft: async (data: any) =>
    apiCall("/mo/save-draft", { method: "POST", body: JSON.stringify(data) }),
};
