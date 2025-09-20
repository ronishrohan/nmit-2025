import { create } from "zustand";
import {
  BillOfMaterial,
  CreateBillOfMaterialDto,
  UpdateBillOfMaterialDto,
  Product,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";

interface BOMFilters {
  productId?: number;
  componentId?: number;
  operation?: string;
  search?: string;
}

interface BOMStore {
  // State
  billOfMaterials: BillOfMaterial[];
  currentBOM: BillOfMaterial | null;
  loading: boolean;
  error: string | null;
  filters: BOMFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setBillOfMaterials: (boms: BillOfMaterial[]) => void;
  setCurrentBOM: (bom: BillOfMaterial | null) => void;
  addBOM: (bom: BillOfMaterial) => void;
  updateBOM: (bom: BillOfMaterial) => void;
  removeBOM: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<BOMFilters>) => void;
  clearFilters: () => void;
  setPagination: (
    pagination: Partial<BOMStore["pagination"]>,
  ) => void;

  // API Actions
  fetchBillOfMaterials: (
    filters?: BOMFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchBOMById: (id: number) => Promise<void>;
  fetchBOMByProduct: (productId: number) => Promise<void>;
  createBOM: (data: CreateBillOfMaterialDto) => Promise<BillOfMaterial | null>;
  updateBOMById: (data: UpdateBillOfMaterialDto) => Promise<BillOfMaterial | null>;
  deleteBOM: (id: number) => Promise<boolean>;
  createBulkBOM: (data: CreateBillOfMaterialDto[]) => Promise<BillOfMaterial[] | null>;

  // Utility Actions
  getBOMByProduct: (productId: number) => BillOfMaterial[];
  getBOMByComponent: (componentId: number) => BillOfMaterial[];
  getBOMByOperation: (operation: string) => BillOfMaterial[];
  searchBOM: (query: string) => BillOfMaterial[];
  getBOMCount: () => number;
  getUniqueProducts: () => Product[];
  getUniqueComponents: () => Product[];
  getUniqueOperations: () => string[];
  calculateTotalQuantityForProduct: (productId: number) => number;
  calculateMaterialCost: (productId: number, productionQuantity: number) => number;
  getMaterialRequirements: (productId: number, quantity: number) => { component: Product; requiredQuantity: number }[];
  validateBOMStructure: (productId: number) => { valid: boolean; errors: string[] };
  getMultiLevelBOM: (productId: number) => BillOfMaterial[];

  // Reset
  reset: () => void;
}

const initialState = {
  billOfMaterials: [],
  currentBOM: null,
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

export const useBOMStore = create<BOMStore>((set, get) => ({
  ...initialState,

  // State setters
  setBillOfMaterials: (boms) => set({ billOfMaterials: boms }),
  setCurrentBOM: (bom) => set({ currentBOM: bom }),
  addBOM: (bom) =>
    set((state) => ({
      billOfMaterials: [...state.billOfMaterials, bom],
    })),
  updateBOM: (bom) =>
    set((state) => ({
      billOfMaterials: state.billOfMaterials.map((b) =>
        b.id === bom.id ? bom : b,
      ),
      currentBOM:
        state.currentBOM?.id === bom.id ? bom : state.currentBOM,
    })),
  removeBOM: (id) =>
    set((state) => ({
      billOfMaterials: state.billOfMaterials.filter((b) => b.id !== id),
      currentBOM: state.currentBOM?.id === id ? null : state.currentBOM,
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
  fetchBillOfMaterials: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.productId)
        queryParams.append("productId", filters.productId.toString());
      if (filters?.componentId)
        queryParams.append("componentId", filters.componentId.toString());
      if (filters?.operation) queryParams.append("operation", filters.operation);
      if (filters?.search) queryParams.append("search", filters.search);

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/bill-of-materials?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<BillOfMaterial>> =
        await response.json();

      if (result.success && result.data) {
        set({
          billOfMaterials: result.data.data,
          pagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          filters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch bill of materials" });
      }
    } catch (error) {
      set({ error: "Network error while fetching bill of materials" });
      console.error("Fetch BOM error:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchBOMById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/bill-of-materials/${id}`);
      const result: ApiResponse<BillOfMaterial> = await response.json();

      if (result.success && result.data) {
        set({ currentBOM: result.data });
      } else {
        set({ error: result.error || "Failed to fetch BOM" });
      }
    } catch (error) {
      set({ error: "Network error while fetching BOM" });
      console.error("Fetch BOM error:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchBOMByProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/bill-of-materials?productId=${productId}`);
      const result: ApiResponse<BillOfMaterial[]> = await response.json();

      if (result.success && result.data) {
        set({ billOfMaterials: result.data });
      } else {
        set({ error: result.error || "Failed to fetch BOM for product" });
      }
    } catch (error) {
      set({ error: "Network error while fetching BOM" });
      console.error("Fetch BOM by product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createBOM: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/bill-of-materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<BillOfMaterial> = await response.json();

      if (result.success && result.data) {
        const newBOM = result.data;
        set((state) => ({
          billOfMaterials: [...state.billOfMaterials, newBOM],
        }));
        return newBOM;
      } else {
        set({ error: result.error || "Failed to create BOM" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating BOM" });
      console.error("Create BOM error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateBOMById: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/bill-of-materials/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<BillOfMaterial> = await response.json();

      if (result.success && result.data) {
        const updatedBOM = result.data;
        set((state) => ({
          billOfMaterials: state.billOfMaterials.map((b) =>
            b.id === updatedBOM.id ? updatedBOM : b,
          ),
          currentBOM:
            state.currentBOM?.id === updatedBOM.id
              ? updatedBOM
              : state.currentBOM,
        }));
        return updatedBOM;
      } else {
        set({ error: result.error || "Failed to update BOM" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while updating BOM" });
      console.error("Update BOM error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteBOM: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/bill-of-materials/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          billOfMaterials: state.billOfMaterials.filter((b) => b.id !== id),
          currentBOM:
            state.currentBOM?.id === id ? null : state.currentBOM,
        }));
        return true;
      } else {
        set({ error: result.error || "Failed to delete BOM" });
        return false;
      }
    } catch (error) {
      set({ error: "Network error while deleting BOM" });
      console.error("Delete BOM error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  createBulkBOM: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/bill-of-materials/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: data }),
      });

      const result: ApiResponse<BillOfMaterial[]> = await response.json();

      if (result.success && result.data) {
        const newBOMs = result.data;
        set((state) => ({
          billOfMaterials: [...state.billOfMaterials, ...newBOMs],
        }));
        return newBOMs;
      } else {
        set({ error: result.error || "Failed to create bulk BOM" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating bulk BOM" });
      console.error("Create bulk BOM error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Utility functions
  getBOMByProduct: (productId) => {
    return get().billOfMaterials.filter((bom) => bom.productId === productId);
  },

  getBOMByComponent: (componentId) => {
    return get().billOfMaterials.filter((bom) => bom.componentId === componentId);
  },

  getBOMByOperation: (operation) => {
    return get().billOfMaterials.filter((bom) => bom.operation === operation);
  },

  searchBOM: (query) => {
    const boms = get().billOfMaterials;
    const lowerQuery = query.toLowerCase();
    return boms.filter(
      (bom) =>
        bom.product.name.toLowerCase().includes(lowerQuery) ||
        bom.component.name.toLowerCase().includes(lowerQuery) ||
        bom.operation?.toLowerCase().includes(lowerQuery),
    );
  },

  getBOMCount: () => {
    return get().billOfMaterials.length;
  },

  getUniqueProducts: () => {
    const boms = get().billOfMaterials;
    const uniqueProducts = new Map<number, Product>();

    boms.forEach((bom) => {
      if (!uniqueProducts.has(bom.productId)) {
        uniqueProducts.set(bom.productId, bom.product);
      }
    });

    return Array.from(uniqueProducts.values());
  },

  getUniqueComponents: () => {
    const boms = get().billOfMaterials;
    const uniqueComponents = new Map<number, Product>();

    boms.forEach((bom) => {
      if (!uniqueComponents.has(bom.componentId)) {
        uniqueComponents.set(bom.componentId, bom.component);
      }
    });

    return Array.from(uniqueComponents.values());
  },

  getUniqueOperations: () => {
    const boms = get().billOfMaterials;
    const operations = new Set<string>();

    boms.forEach((bom) => {
      if (bom.operation) {
        operations.add(bom.operation);
      }
    });

    return Array.from(operations);
  },

  calculateTotalQuantityForProduct: (productId) => {
    const productBOMs = get().getBOMByProduct(productId);
    return productBOMs.reduce((total, bom) => total + bom.quantity, 0);
  },

  calculateMaterialCost: (productId, productionQuantity) => {
    const productBOMs = get().getBOMByProduct(productId);
    // This would need to be enhanced with actual cost data from components
    // For now, returning a placeholder calculation
    return productBOMs.reduce((totalCost, bom) => {
      // Assuming components have a cost property (would need to be added to Product interface)
      const componentCost = 0; // bom.component.cost || 0;
      return totalCost + (bom.quantity * productionQuantity * componentCost);
    }, 0);
  },

  getMaterialRequirements: (productId, quantity) => {
    const productBOMs = get().getBOMByProduct(productId);
    return productBOMs.map((bom) => ({
      component: bom.component,
      requiredQuantity: bom.quantity * quantity,
    }));
  },

  validateBOMStructure: (productId) => {
    const productBOMs = get().getBOMByProduct(productId);
    const errors: string[] = [];
    let valid = true;

    if (productBOMs.length === 0) {
      errors.push("No BOM entries found for this product");
      valid = false;
    }

    // Check for circular dependencies
    const checkCircularDependency = (currentProductId: number, visited: Set<number>): boolean => {
      if (visited.has(currentProductId)) {
        return true; // Circular dependency found
      }

      visited.add(currentProductId);
      const boms = get().getBOMByProduct(currentProductId);

      for (const bom of boms) {
        if (checkCircularDependency(bom.componentId, new Set(visited))) {
          return true;
        }
      }

      return false;
    };

    if (checkCircularDependency(productId, new Set())) {
      errors.push("Circular dependency detected in BOM structure");
      valid = false;
    }

    // Check for duplicate components in same operation
    const operationComponents = new Map<string, Set<number>>();
    productBOMs.forEach((bom) => {
      const operation = bom.operation || "default";
      if (!operationComponents.has(operation)) {
        operationComponents.set(operation, new Set());
      }

      const components = operationComponents.get(operation)!;
      if (components.has(bom.componentId)) {
        errors.push(`Duplicate component ${bom.component.name} in operation ${operation}`);
        valid = false;
      } else {
        components.add(bom.componentId);
      }
    });

    return { valid, errors };
  },

  getMultiLevelBOM: (productId) => {
    const result: BillOfMaterial[] = [];
    const visited = new Set<number>();

    const traverse = (currentProductId: number) => {
      if (visited.has(currentProductId)) {
        return; // Avoid infinite recursion
      }

      visited.add(currentProductId);
      const boms = get().getBOMByProduct(currentProductId);

      boms.forEach((bom) => {
        result.push(bom);
        // Recursively get BOMs for components that are also products
        const componentBOMs = get().getBOMByProduct(bom.componentId);
        if (componentBOMs.length > 0) {
          traverse(bom.componentId);
        }
      });
    };

    traverse(productId);
    return result;
  },

  // Reset store
  reset: () => set(initialState),
}));
