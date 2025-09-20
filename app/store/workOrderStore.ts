import { create } from "zustand";
import {
  WorkOrder,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderFilters,
  WorkStatus,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";

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
  fetchWorkOrders: (
    filters?: WorkOrderFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchWorkOrderById: (id: number) => Promise<void>;
  fetchWorkOrdersByMO: (moId: number) => Promise<void>;
  createWorkOrder: (data: CreateWorkOrderDto) => Promise<WorkOrder | null>;
  updateWorkOrderById: (data: UpdateWorkOrderDto) => Promise<WorkOrder | null>;
  deleteWorkOrder: (id: number) => Promise<boolean>;
  startWorkOrder: (id: number) => Promise<WorkOrder | null>;
  pauseWorkOrder: (id: number) => Promise<WorkOrder | null>;
  completeWorkOrder: (id: number) => Promise<WorkOrder | null>;

  // Utility Actions
  getOrdersByStatus: (status: WorkStatus) => WorkOrder[];
  getOrdersByMO: (moId: number) => WorkOrder[];
  getOrdersByWorkCenter: (workCenterId: number) => WorkOrder[];
  getOrdersByAssignee: (assigneeId: number) => WorkOrder[];
  searchOrders: (query: string) => WorkOrder[];
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
  fetchWorkOrders: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.moId) queryParams.append("moId", filters.moId.toString());
      if (filters?.workCenterId)
        queryParams.append("workCenterId", filters.workCenterId.toString());
      if (filters?.assignedToId)
        queryParams.append("assignedToId", filters.assignedToId.toString());
      if (filters?.dateFrom)
        queryParams.append("dateFrom", filters.dateFrom.toISOString());
      if (filters?.dateTo)
        queryParams.append("dateTo", filters.dateTo.toISOString());
      if (filters?.search) queryParams.append("search", filters.search);

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/work-orders?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<WorkOrder>> =
        await response.json();

      if (result.success && result.data) {
        set({
          workOrders: result.data.data,
          pagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          filters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch work orders" });
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
      const response = await fetch(`/api/work-orders/${id}`);
      const result: ApiResponse<WorkOrder> = await response.json();

      if (result.success && result.data) {
        set({ currentWorkOrder: result.data });
      } else {
        set({ error: result.error || "Failed to fetch work order" });
      }
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
      const response = await fetch(`/api/work-orders?moId=${moId}`);
      const result: ApiResponse<WorkOrder[]> = await response.json();

      if (result.success && result.data) {
        set({ workOrders: result.data });
      } else {
        set({ error: result.error || "Failed to fetch work orders for MO" });
      }
    } catch (error) {
      set({ error: "Network error while fetching work orders" });
      console.error("Fetch work orders by MO error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createWorkOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<WorkOrder> = await response.json();

      if (result.success && result.data) {
        const newOrder = result.data;
        set((state) => ({
          workOrders: [...state.workOrders, newOrder],
        }));
        return newOrder;
      } else {
        set({ error: result.error || "Failed to create work order" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating work order" });
      console.error("Create work order error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateWorkOrderById: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/work-orders/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<WorkOrder> = await response.json();

      if (result.success && result.data) {
        const updatedOrder = result.data;
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === updatedOrder.id ? updatedOrder : wo,
          ),
          currentWorkOrder:
            state.currentWorkOrder?.id === updatedOrder.id
              ? updatedOrder
              : state.currentWorkOrder,
        }));
        return updatedOrder;
      } else {
        set({ error: result.error || "Failed to update work order" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while updating work order" });
      console.error("Update work order error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteWorkOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          workOrders: state.workOrders.filter((wo) => wo.id !== id),
          currentWorkOrder:
            state.currentWorkOrder?.id === id ? null : state.currentWorkOrder,
        }));
        return true;
      } else {
        set({ error: result.error || "Failed to delete work order" });
        return false;
      }
    } catch (error) {
      set({ error: "Network error while deleting work order" });
      console.error("Delete work order error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  startWorkOrder: async (id) => {
    return get().updateWorkOrderById({
      id,
      status: WorkStatus.STARTED,
      startedAt: new Date(),
    });
  },

  pauseWorkOrder: async (id) => {
    return get().updateWorkOrderById({
      id,
      status: WorkStatus.PAUSED,
    });
  },

  completeWorkOrder: async (id) => {
    return get().updateWorkOrderById({
      id,
      status: WorkStatus.COMPLETED,
      completedAt: new Date(),
    });
  },

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

  searchOrders: (query) => {
    const orders = get().workOrders;
    const lowerQuery = query.toLowerCase();
    return orders.filter(
      (order) =>
        order.operation.toLowerCase().includes(lowerQuery) ||
        order.comments?.toLowerCase().includes(lowerQuery) ||
        order.workCenter?.name.toLowerCase().includes(lowerQuery) ||
        order.assignedTo?.fullName?.toLowerCase().includes(lowerQuery) ||
        order.status.toLowerCase().includes(lowerQuery),
    );
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
