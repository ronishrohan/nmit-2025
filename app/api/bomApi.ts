import { apiCall } from "../lib/api";

export const bomApi = {
  getAll: async () => apiCall("/fetch/billofmaterials"),
  getById: async (id: number) => apiCall(`/fetch/billofmaterials/${id}`),
  search: async (q: string) =>
    apiCall(`/fetch/billofmaterials?q=${encodeURIComponent(q)}`),
  create: async (data: any) =>
    apiCall("/bom/new", { method: "POST", body: JSON.stringify(data) }),
  update: async (id: number, data: any) =>
    apiCall(`/bom/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: number) => apiCall(`/bom/${id}`, { method: "DELETE" }),
};
