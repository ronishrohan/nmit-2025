import { apiCall } from "../lib/api";

export const productApi = {
  getAll: async () => apiCall("/products"),
  getById: async (id: number) => apiCall(`/products/${id}`),
  search: async (q: string, limit = 20) =>
    apiCall(`/products/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  getLowStock: async (threshold = 10) =>
    apiCall(`/products/low-stock?threshold=${threshold}`),
  create: async (data: any) =>
    apiCall("/products", { method: "POST", body: JSON.stringify(data) }),
  update: async (id: number, data: any) =>
    apiCall(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: number) =>
    apiCall(`/products/${id}`, { method: "DELETE" }),
};
