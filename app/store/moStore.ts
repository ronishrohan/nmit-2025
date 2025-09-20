import { create } from "zustand";
import {
  ManufacturingOrder,
  ManufacturingOrderFilters,
  OrderStatus,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";
import { moApi } from "@/app/api/moApi";

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
  fetchManufacturingOrders: () => Promise<void>;
  fetchManufacturingOrderById: (id: number) => Promise<void>;

  // Utility Actions
  getOrdersByStatus: (status: OrderStatus) => ManufacturingOrder[];
  getOrdersByAssignee: (assigneeId: number) => ManufacturingOrder[];
  getOrdersByCreator: (creatorId: number) => ManufacturingOrder[];
  getOrdersByProduct: (productId: number) => ManufacturingOrder[];
  searchOrders: (query: string) => Promise<ManufacturingOrder[]>;
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
  fetchManufacturingOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await moApi.getAll();
      const manufacturingOrders = Array.isArray(response.data) ? response.data : [];
      console.log(manufacturingOrders[0].product, "fetched MOs");
      set({ manufacturingOrders });
      if (!manufacturingOrders.length) {
        set({ error: response.message || "No manufacturing orders found" });
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
      let manufacturingOrders = get().manufacturingOrders;
      if (!manufacturingOrders.length) {
        const response = await moApi.getAll();
        manufacturingOrders = Array.isArray(response.data) ? response.data : [];
      }
      const order = manufacturingOrders.find((o: any) => o.id === id) || null;
      set({ currentOrder: order });
      if (!order) set({ error: "Manufacturing order not found" });
    } catch (error) {
      set({ error: "Network error while fetching manufacturing order" });
      console.error("Fetch manufacturing order error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Remove create/update/delete actions (not supported by backend)
  createManufacturingOrder: async () => null,
  updateManufacturingOrderById: async () => null,
  deleteManufacturingOrder: async () => false,

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

  searchOrders: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await moApi.search(query);
      const manufacturingOrders = Array.isArray(response.data) ? response.data : [];
      set({ manufacturingOrders });
      return manufacturingOrders;
    } catch (error) {
      set({ error: "Network error while searching manufacturing orders" });
      console.error("Search manufacturing orders error:", error);
      return [];
    } finally {
      set({ loading: false });
    }
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
