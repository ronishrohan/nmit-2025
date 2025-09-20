import { apiCall } from "../lib/api";

export const workCenterApi = {
  getAll: async () => apiCall("/fetch/workcenters"),
  getById: async (id: number) => apiCall(`/fetch/workcenters/${id}`),
  search: async (q: string) =>
    apiCall(`/fetch/workcenters?q=${encodeURIComponent(q)}`),
  create: async (data: any) =>
    apiCall("/workCenters/new", { method: "POST", body: JSON.stringify(data) }),
};
