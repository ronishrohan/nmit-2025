import { create } from "zustand";
import {
  WorkCenter,
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  WorkCenterFilters,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";

interface WorkCenterStore {
  // State
  workCenters: WorkCenter[];
  currentWorkCenter: WorkCenter | null;
  loading: boolean;
  error: string | null;
  filters: WorkCenterFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setWorkCenters: (centers: WorkCenter[]) => void;
  setCurrentWorkCenter: (center: WorkCenter | null) => void;
  addWorkCenter: (center: WorkCenter) => void;
  updateWorkCenter: (center: WorkCenter) => void;
  removeWorkCenter: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<WorkCenterFilters>) => void;
  clearFilters: () => void;
  setPagination: (
    pagination: Partial<WorkCenterStore["pagination"]>,
  ) => void;

  // API Actions
  fetchWorkCenters: (
    filters?: WorkCenterFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchWorkCenterById: (id: number) => Promise<void>;
  createWorkCenter: (data: CreateWorkCenterDto) => Promise<WorkCenter | null>;
  updateWorkCenterById: (data: UpdateWorkCenterDto) => Promise<WorkCenter | null>;
  deleteWorkCenter: (id: number) => Promise<boolean>;

  // Utility Actions
  getWorkCentersByLocation: (location: string) => WorkCenter[];
  searchWorkCenters: (query: string) => WorkCenter[];
  getActiveWorkCenters: () => WorkCenter[];
  getWorkCentersWithCapacity: () => WorkCenter[];
  getWorkCentersCount: () => number;
  getTotalCapacity: () => number;
  getAverageCapacity: () => number;
  getTotalDowntime: () => number;
  getUtilizationData: () => { center: WorkCenter; utilization: number }[];

  // Reset
  reset: () => void;
}

const initialState = {
  workCenters: [],
  currentWorkCenter: null,
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

export const useWorkCenterStore = create<WorkCenterStore>((set, get) => ({
  ...initialState,

  // State setters
  setWorkCenters: (centers) => set({ workCenters: centers }),
  setCurrentWorkCenter: (center) => set({ currentWorkCenter: center }),
  addWorkCenter: (center) =>
    set((state) => ({
      workCenters: [...state.workCenters, center],
    })),
  updateWorkCenter: (center) =>
    set((state) => ({
      workCenters: state.workCenters.map((wc) =>
        wc.id === center.id ? center : wc,
      ),
      currentWorkCenter:
        state.currentWorkCenter?.id === center.id
          ? center
          : state.currentWorkCenter,
    })),
  removeWorkCenter: (id) =>
    set((state) => ({
      workCenters: state.workCenters.filter((wc) => wc.id !== id),
      currentWorkCenter:
        state.currentWorkCenter?.id === id ? null : state.currentWorkCenter,
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
  fetchWorkCenters: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.location) queryParams.append("location", filters.location);
      if (filters?.search) queryParams.append("search", filters.search);

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/work-centers?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<WorkCenter>> =
        await response.json();

      if (result.success && result.data) {
        set({
          workCenters: result.data.data,
          pagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          filters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch work centers" });
      }
    } catch (error) {
      set({ error: "Network error while fetching work centers" });
      console.error("Fetch work centers error:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchWorkCenterById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/work-centers/${id}`);
      const result: ApiResponse<WorkCenter> = await response.json();

      if (result.success && result.data) {
        set({ currentWorkCenter: result.data });
      } else {
        set({ error: result.error || "Failed to fetch work center" });
      }
    } catch (error) {
      set({ error: "Network error while fetching work center" });
      console.error("Fetch work center error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createWorkCenter: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/work-centers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<WorkCenter> = await response.json();

      if (result.success && result.data) {
        const newCenter = result.data;
        set((state) => ({
          workCenters: [...state.workCenters, newCenter],
        }));
        return newCenter;
      } else {
        set({ error: result.error || "Failed to create work center" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating work center" });
      console.error("Create work center error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateWorkCenterById: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/work-centers/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<WorkCenter> = await response.json();

      if (result.success && result.data) {
        const updatedCenter = result.data;
        set((state) => ({
          workCenters: state.workCenters.map((wc) =>
            wc.id === updatedCenter.id ? updatedCenter : wc,
          ),
          currentWorkCenter:
            state.currentWorkCenter?.id === updatedCenter.id
              ? updatedCenter
              : state.currentWorkCenter,
        }));
        return updatedCenter;
      } else {
        set({ error: result.error || "Failed to update work center" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while updating work center" });
      console.error("Update work center error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteWorkCenter: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/work-centers/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          workCenters: state.workCenters.filter((wc) => wc.id !== id),
          currentWorkCenter:
            state.currentWorkCenter?.id === id ? null : state.currentWorkCenter,
        }));
        return true;
      } else {
        set({ error: result.error || "Failed to delete work center" });
        return false;
      }
    } catch (error) {
      set({ error: "Network error while deleting work center" });
      console.error("Delete work center error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Utility functions
  getWorkCentersByLocation: (location) => {
    return get().workCenters.filter(
      (center) => center.location?.toLowerCase() === location.toLowerCase(),
    );
  },

  searchWorkCenters: (query) => {
    const centers = get().workCenters;
    const lowerQuery = query.toLowerCase();
    return centers.filter(
      (center) =>
        center.name.toLowerCase().includes(lowerQuery) ||
        center.location?.toLowerCase().includes(lowerQuery),
    );
  },

  getActiveWorkCenters: () => {
    // Assuming active means centers with work orders or with capacity
    return get().workCenters.filter(
      (center) =>
        (center.workOrders && center.workOrders.length > 0) ||
        (center.capacityPerHour && center.capacityPerHour > 0),
    );
  },

  getWorkCentersWithCapacity: () => {
    return get().workCenters.filter(
      (center) => center.capacityPerHour && center.capacityPerHour > 0,
    );
  },

  getWorkCentersCount: () => {
    return get().workCenters.length;
  },

  getTotalCapacity: () => {
    return get().workCenters.reduce(
      (total, center) => total + (center.capacityPerHour || 0),
      0,
    );
  },

  getAverageCapacity: () => {
    const centers = get().getWorkCentersWithCapacity();
    if (centers.length === 0) return 0;

    const totalCapacity = centers.reduce(
      (total, center) => total + (center.capacityPerHour || 0),
      0,
    );
    return totalCapacity / centers.length;
  },

  getTotalDowntime: () => {
    return get().workCenters.reduce(
      (total, center) => total + center.downtimeMins,
      0,
    );
  },

  getUtilizationData: () => {
    return get().workCenters.map((center) => {
      const totalWorkTime = center.workOrders
        ? center.workOrders.reduce(
            (total, order) => total + order.durationDoneMins,
            0,
          )
        : 0;

      // Calculate utilization as percentage of capacity used
      // This is a simplified calculation - in real scenarios you'd consider time periods
      const dailyCapacityMins = (center.capacityPerHour || 0) * 24 * 60;
      const utilization = dailyCapacityMins > 0
        ? Math.min(100, (totalWorkTime / dailyCapacityMins) * 100)
        : 0;

      return {
        center,
        utilization: Math.round(utilization),
      };
    });
  },

  // Reset store
  reset: () => set(initialState),
}));
