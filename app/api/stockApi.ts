import { apiCall, getAuthToken } from "../lib/api";

export const stockApi = {
  getAll: async () => apiCall("/stock"),
  getById: async (id: number) => apiCall(`/stock/${id}`),
  getLedger: async () => apiCall("/stock/ledger"),
  getLedgerByProduct: async (id: number) => apiCall(`/stock/${id}/ledger`),
  getLowStock: async (threshold = 10) =>
    apiCall(`/stock/low-stock?threshold=${threshold}`),
  update: async (id: number, data: any) =>
    apiCall(`/stock/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: number) => apiCall(`/stock/${id}`, { method: "DELETE" }),
  recordMovement: async (data: any) =>
    apiCall("/stock/movement", { method: "POST", body: JSON.stringify(data) }),
};

export const getStockLedger = async (token?: string) => {
  // Use token if provided, else get from getAuthToken
  if (token) localStorage.setItem("token", token);
  const res = await stockApi.getAll();
  if (!res.status) throw new Error(res.message || "Failed to fetch stock ledger");
  return res;
};
