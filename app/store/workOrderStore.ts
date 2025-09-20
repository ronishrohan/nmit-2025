import { create } from "zustand";
import {
  WorkOrder,
  WorkOrderFilters,
  WorkStatus,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";
import { fetchApi } from "@/app/lib/api";
import { woApi } from "@/app/api/woApi";

interface WorkOrderStore {
  // State
  workOrders: WorkOrder[];
  currentWorkOrder: WorkOrder | null;
  loading: boolean;
  error: string | null;
  filters: WorkOrderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setWorkOrders: (orders: WorkOrder[]) => void;
  setCurrentWorkOrder: (order: WorkOrder | null) => void;
  addWorkOrder: (order: WorkOrder) => void;
  updateWorkOrder: (order: WorkOrder) => void;
  removeWorkOrder: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<WorkOrderFilters>) => void;
  clearFilters: () => void;
  setPagination: (
    pagination: Partial<WorkOrderStore["pagination"]>,
  ) => void;

  // API Actions
  fetchWorkOrders: () => Promise<void>;
  fetchWorkOrderById: (id: number) => Promise<void>;
  fetchWorkOrdersByMO: (moId: number) => Promise<void>;

  // Utility Actions
  getOrdersByStatus: (status: WorkStatus) => WorkOrder[];
  getOrdersByMO: (moId: number) => WorkOrder[];
  getOrdersByWorkCenter: (workCenterId: number) => WorkOrder[];
  getOrdersByAssignee: (assigneeId: number) => WorkOrder[];
  searchOrders: (query: string) => Promise<WorkOrder[]>;
  getOrdersCount: () => number;
  getOrdersCountByStatus: (status: WorkStatus) => number;
  getActiveOrders: () => WorkOrder[];
  getOverdueOrders: () => WorkOrder[];
  getTotalDuration: (orders?: WorkOrder[]) => number;
  getTotalCompletedDuration: (orders?: WorkOrder[]) => number;
  getCompletionPercentage: (orders?: WorkOrder[]) => number;

  // Reset
  reset: () => void;
}

const initialState = {
  workOrders: [],
  currentWorkOrder: null,
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

export const useWorkOrderStore = create<WorkOrderStore>((set, get) => ({
  ...initialState,

  // State setters
  setWorkOrders: (orders) => set({ workOrders: orders }),
  setCurrentWorkOrder: (order) => set({ currentWorkOrder: order }),
  addWorkOrder: (order) =>
    set((state) => ({
      workOrders: [...state.workOrders, order],
    })),
  updateWorkOrder: (order) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === order.id ? order : wo,
      ),
      currentWorkOrder:
        state.currentWorkOrder?.id === order.id ? order : state.currentWorkOrder,
    })),
  removeWorkOrder: (id) =>
    set((state) => ({
      workOrders: state.workOrders.filter((wo) => wo.id !== id),
      currentWorkOrder: state.currentWorkOrder?.id === id ? null : state.currentWorkOrder,
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
  fetchWorkOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await woApi.getAll();
      const workOrders = Array.isArray(response.data) ? response.data : [];
      set({ workOrders });
      if (!workOrders.length) {
        set({ error: response.message || "No work orders found" });
      }
    } catch (error) {
      set({ error: "Network error while fetching work orders" });
      console.error("Fetch work orders error:", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchWorkOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      let workOrders = get().workOrders;
      if (!workOrders.length) {
        const response = await woApi.getAll();
        workOrders = Array.isArray(response.data) ? response.data : [];
      }
      const order = workOrders.find((o: any) => o.id === id) || null;
      set({ currentWorkOrder: order });
      if (!order) set({ error: "Work order not found" });
    } catch (error) {
      set({ error: "Network error while fetching work order" });
      console.error("Fetch work order error:", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchWorkOrdersByMO: async (moId) => {
    set({ loading: true, error: null });
    try {
      let workOrders = get().workOrders;
      if (!workOrders.length) {
        const response = await woApi.getAll();
        workOrders = Array.isArray(response.data) ? response.data : [];
      }
      const filtered = workOrders.filter((wo: any) => wo.moId === moId);
      set({ workOrders: filtered });
      if (!filtered.length) set({ error: "No work orders for this MO" });
    } catch (error) {
      set({ error: "Network error while fetching work orders" });
      console.error("Fetch work orders by MO error:", error);
    } finally {
      set({ loading: false });
    }
  },
  searchOrders: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await woApi.search(query);
      const workOrders = Array.isArray(response.data) ? response.data : [];
      set({ workOrders });
      if (!workOrders.length) {
        set({ error: response.message || "No work orders found" });
      }
      return workOrders;
    } catch (error) {
      set({ error: "Network error while searching work orders" });
      console.error("Search work orders error:", error);
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // Remove create/update/delete/start/pause/complete actions (not supported by backend)
  createWorkOrder: async () => null,
  updateWorkOrderById: async () => null,
  deleteWorkOrder: async () => false,
  startWorkOrder: async () => null,
  pauseWorkOrder: async () => null,
  completeWorkOrder: async () => null,

  // Utility functions
  getOrdersByStatus: (status) => {
    return get().workOrders.filter((order) => order.status === status);
  },

  getOrdersByMO: (moId) => {
    return get().workOrders.filter((order) => order.moId === moId);
  },

  getOrdersByWorkCenter: (workCenterId) => {
    return get().workOrders.filter((order) => order.workCenterId === workCenterId);
  },

  getOrdersByAssignee: (assigneeId) => {
    return get().workOrders.filter((order) => order.assignedToId === assigneeId);
  },

  getOrdersCount: () => {
    return get().workOrders.length;
  },

  getOrdersCountByStatus: (status) => {
    return get().workOrders.filter((order) => order.status === status).length;
  },

  getActiveOrders: () => {
    return get().workOrders.filter(
      (order) => order.status === WorkStatus.STARTED || order.status === WorkStatus.TO_DO,
    );
  },

  getOverdueOrders: () => {
    const now = new Date();
    return get().workOrders.filter((order) => {
      if (!order.mo.deadline) return false;
      return new Date(order.mo.deadline) < now && order.status !== WorkStatus.COMPLETED;
    });
  },

  getTotalDuration: (orders) => {
    const ordersToUse = orders || get().workOrders;
    return ordersToUse.reduce((total, order) => total + order.durationMins, 0);
  },

  getTotalCompletedDuration: (orders) => {
    const ordersToUse = orders || get().workOrders;
    return ordersToUse.reduce((total, order) => total + order.durationDoneMins, 0);
  },

  getCompletionPercentage: (orders) => {
    const ordersToUse = orders || get().workOrders;
    const totalDuration = get().getTotalDuration(ordersToUse);
    const completedDuration = get().getTotalCompletedDuration(ordersToUse);

    if (totalDuration === 0) return 0;
    return Math.round((completedDuration / totalDuration) * 100);
  },

  // Reset store
  reset: () => set(initialState),
}));
