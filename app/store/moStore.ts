import { create } from "zustand";
import {
  ManufacturingOrder,
  CreateManufacturingOrderDto,
  UpdateManufacturingOrderDto,
  ManufacturingOrderFilters,
  OrderStatus,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";

interface ManufacturingOrderStore {
  // State
  manufacturingOrders: ManufacturingOrder[];
  currentOrder: ManufacturingOrder | null;
  loading: boolean;
  error: string | null;
  filters: ManufacturingOrderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setManufacturingOrders: (orders: ManufacturingOrder[]) => void;
  setCurrentOrder: (order: ManufacturingOrder | null) => void;
  addManufacturingOrder: (order: ManufacturingOrder) => void;
  updateManufacturingOrder: (order: ManufacturingOrder) => void;
  removeManufacturingOrder: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ManufacturingOrderFilters>) => void;
  clearFilters: () => void;
  setPagination: (
    pagination: Partial<ManufacturingOrderStore["pagination"]>,
  ) => void;

  // API Actions
  fetchManufacturingOrders: (
    filters?: ManufacturingOrderFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchManufacturingOrderById: (id: number) => Promise<void>;
  createManufacturingOrder: (
    data: CreateManufacturingOrderDto,
  ) => Promise<ManufacturingOrder | null>;
  updateManufacturingOrderById: (
    data: UpdateManufacturingOrderDto,
  ) => Promise<ManufacturingOrder | null>;
  deleteManufacturingOrder: (id: number) => Promise<boolean>;

  // Utility Actions
  getOrdersByStatus: (status: OrderStatus) => ManufacturingOrder[];
  getOrdersByAssignee: (assigneeId: number) => ManufacturingOrder[];
  getOrdersByCreator: (creatorId: number) => ManufacturingOrder[];
  getOrdersByProduct: (productId: number) => ManufacturingOrder[];
  searchOrders: (query: string) => ManufacturingOrder[];
  getOrdersCount: () => number;
  getOrdersCountByStatus: (status: OrderStatus) => number;

  // Reset
  reset: () => void;
}

const initialState = {
  manufacturingOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useMoStore = create<ManufacturingOrderStore>((set, get) => ({
  ...initialState,

  // State setters
  setManufacturingOrders: (orders) => set({ manufacturingOrders: orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  addManufacturingOrder: (order) =>
    set((state) => ({
      manufacturingOrders: [...state.manufacturingOrders, order],
    })),
  updateManufacturingOrder: (order) =>
    set((state) => ({
      manufacturingOrders: state.manufacturingOrders.map((mo) =>
        mo.id === order.id ? order : mo,
      ),
      currentOrder:
        state.currentOrder?.id === order.id ? order : state.currentOrder,
    })),
  removeManufacturingOrder: (id) =>
    set((state) => ({
      manufacturingOrders: state.manufacturingOrders.filter(
        (mo) => mo.id !== id,
      ),
      currentOrder: state.currentOrder?.id === id ? null : state.currentOrder,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearFilters: () => set({ filters: {} }),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  // API Actions
  fetchManufacturingOrders: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.createdById)
        queryParams.append("createdById", filters.createdById.toString());
      if (filters?.assignedToId)
        queryParams.append("assignedToId", filters.assignedToId.toString());
      if (filters?.productId)
        queryParams.append("productId", filters.productId.toString());
      if (filters?.dateFrom)
        queryParams.append("dateFrom", filters.dateFrom.toISOString());
      if (filters?.dateTo)
        queryParams.append("dateTo", filters.dateTo.toISOString());
      if (filters?.search) queryParams.append("search", filters.search);

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/manufacturing-orders?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<ManufacturingOrder>> =
        await response.json();

      if (result.success && result.data) {
        set({
          manufacturingOrders: result.data.data,
          pagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          filters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch manufacturing orders" });
      }
    } catch (error) {
      set({ error: "Network error while fetching manufacturing orders" });
      console.error("Fetch manufacturing orders error:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchManufacturingOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/manufacturing-orders/${id}`);
      const result: ApiResponse<ManufacturingOrder> = await response.json();

      if (result.success && result.data) {
        set({ currentOrder: result.data });
      } else {
        set({ error: result.error || "Failed to fetch manufacturing order" });
      }
    } catch (error) {
      set({ error: "Network error while fetching manufacturing order" });
      console.error("Fetch manufacturing order error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createManufacturingOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/manufacturing-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ManufacturingOrder> = await response.json();

      if (result.success && result.data) {
        const newOrder = result.data;
        set((state) => ({
          manufacturingOrders: [...state.manufacturingOrders, newOrder],
        }));
        return newOrder;
      } else {
        set({ error: result.error || "Failed to create manufacturing order" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating manufacturing order" });
      console.error("Create manufacturing order error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateManufacturingOrderById: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/manufacturing-orders/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ManufacturingOrder> = await response.json();

      if (result.success && result.data) {
        const updatedOrder = result.data;
        set((state) => ({
          manufacturingOrders: state.manufacturingOrders.map((mo) =>
            mo.id === updatedOrder.id ? updatedOrder : mo,
          ),
          currentOrder:
            state.currentOrder?.id === updatedOrder.id
              ? updatedOrder
              : state.currentOrder,
        }));
        return updatedOrder;
      } else {
        set({ error: result.error || "Failed to update manufacturing order" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while updating manufacturing order" });
      console.error("Update manufacturing order error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteManufacturingOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/manufacturing-orders/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          manufacturingOrders: state.manufacturingOrders.filter(
            (mo) => mo.id !== id,
          ),
          currentOrder:
            state.currentOrder?.id === id ? null : state.currentOrder,
        }));
        return true;
      } else {
        set({ error: result.error || "Failed to delete manufacturing order" });
        return false;
      }
    } catch (error) {
      set({ error: "Network error while deleting manufacturing order" });
      console.error("Delete manufacturing order error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Utility functions
  getOrdersByStatus: (status) => {
    return get().manufacturingOrders.filter((order) => order.status === status);
  },

  getOrdersByAssignee: (assigneeId) => {
    return get().manufacturingOrders.filter(
      (order) => order.assignedToId === assigneeId,
    );
  },

  getOrdersByCreator: (creatorId) => {
    return get().manufacturingOrders.filter(
      (order) => order.createdById === creatorId,
    );
  },

  getOrdersByProduct: (productId) => {
    return get().manufacturingOrders.filter(
      (order) => order.productId === productId,
    );
  },

  searchOrders: (query) => {
    const orders = get().manufacturingOrders;
    const lowerQuery = query.toLowerCase();
    return orders.filter(
      (order) =>
        order.product?.name.toLowerCase().includes(lowerQuery) ||
        order.createdBy.fullName?.toLowerCase().includes(lowerQuery) ||
        order.assignedTo?.fullName?.toLowerCase().includes(lowerQuery) ||
        order.status.toLowerCase().includes(lowerQuery),
    );
  },

  getOrdersCount: () => {
    return get().manufacturingOrders.length;
  },

  getOrdersCountByStatus: (status) => {
    return get().manufacturingOrders.filter((order) => order.status === status)
      .length;
  },

  // Reset store
  reset: () => set(initialState),
}));
