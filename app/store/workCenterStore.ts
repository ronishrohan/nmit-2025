import { create } from "zustand";
import {
  WorkCenter,
  WorkCenterFilters,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";
import { fetchApi } from "@/app/lib/api";
import { workCenterApi } from "@/app/api/workCenterApi";

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
  fetchWorkCenters: () => Promise<void>;
  fetchWorkCenterById: (id: number) => Promise<void>;

  // Utility Actions
  getWorkCentersByLocation: (location: string) => WorkCenter[];
  searchWorkCenters: (query: string) => Promise<WorkCenter[]>;
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
  fetchWorkCenters: async () => {
    set({ loading: true, error: null });
    try {
      const response = await workCenterApi.getAll();
      const workCenters = Array.isArray(response.data) ? response.data : [];
      set({ workCenters });
      if (!workCenters.length) {
        set({ error: response.message || "No work centers found" });
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
      let workCenters = get().workCenters;
      if (!workCenters.length) {
        const response = await workCenterApi.getAll();
        workCenters = Array.isArray(response.data) ? response.data : [];
      }
      const center = workCenters.find((c: any) => c.id === id) || null;
      set({ currentWorkCenter: center });
      if (!center) set({ error: "Work center not found" });
    } catch (error) {
      set({ error: "Network error while fetching work center" });
      console.error("Fetch work center error:", error);
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

  searchWorkCenters: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await workCenterApi.search(query);
      const workCenters = Array.isArray(response.data) ? response.data : [];
      set({ workCenters });
      return workCenters;
    } catch (error) {
      set({ error: "Network error while searching work centers" });
      console.error("Search work centers error:", error);
      return [];
    } finally {
      set({ loading: false });
    }
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
