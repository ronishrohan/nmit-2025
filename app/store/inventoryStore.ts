import { create } from "zustand";
import {
  ProductLedger,
  ProductStock,
  CreateProductLedgerDto,
  ProductLedgerFilters,
  MovementType,
  Product,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";
import { fetchApi } from "@/app/lib/api";

interface StockFilters {
  productId?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  search?: string;
}

interface InventoryStore {
  // State
  productLedger: ProductLedger[];
  productStock: ProductStock[];
  currentLedgerEntry: ProductLedger | null;
  currentStock: ProductStock | null;
  loading: boolean;
  error: string | null;
  ledgerFilters: ProductLedgerFilters;
  stockFilters: StockFilters;
  ledgerPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stockPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setProductLedger: (ledger: ProductLedger[]) => void;
  setProductStock: (stock: ProductStock[]) => void;
  setCurrentLedgerEntry: (entry: ProductLedger | null) => void;
  setCurrentStock: (stock: ProductStock | null) => void;
  addLedgerEntry: (entry: ProductLedger) => void;
  updateStock: (stock: ProductStock) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLedgerFilters: (filters: Partial<ProductLedgerFilters>) => void;
  setStockFilters: (filters: Partial<StockFilters>) => void;
  clearLedgerFilters: () => void;
  clearStockFilters: () => void;
  setLedgerPagination: (
    pagination: Partial<InventoryStore["ledgerPagination"]>,
  ) => void;
  setStockPagination: (
    pagination: Partial<InventoryStore["stockPagination"]>,
  ) => void;

  // API Actions - Ledger
  fetchProductLedger: () => Promise<void>;
  fetchLedgerByProduct: (productId: number) => Promise<void>;

  // API Actions - Stock
  fetchProductStock: () => Promise<void>;
  fetchStockByProduct: (productId: number) => Promise<void>;

  // Utility Actions - Ledger
  getLedgerByMovementType: (type: MovementType) => ProductLedger[];
  getLedgerByProduct: (productId: number) => ProductLedger[];
  getLedgerByReference: (
    referenceType: string,
    referenceId: number,
  ) => ProductLedger[];
  searchLedger: (query: string) => ProductLedger[];
  getLedgerCount: () => number;
  getMovementsSummary: () => {
    totalIn: number;
    totalOut: number;
    netMovement: number;
  };
  getRecentMovements: (limit?: number) => ProductLedger[];

  // Utility Actions - Stock
  getStockByProduct: (productId: number) => ProductStock | null;
  getLowStockItems: (threshold?: number) => ProductStock[];
  getOutOfStockItems: () => ProductStock[];
  searchStock: (query: string) => ProductStock[];
  getStockCount: () => number;
  getTotalStockValue: () => number;
  getStockSummary: () => {
    totalItems: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
  };

  // Analysis Functions
  getInventoryTurnover: (productId: number, days: number) => number;
  getMovementHistory: (productId: number, days: number) => ProductLedger[];
  getStockLevels: () => {
    product: Product;
    currentStock: number;
    movements: ProductLedger[];
  }[];
  getInventoryReport: (
    dateFrom: Date,
    dateTo: Date,
  ) => {
    movements: ProductLedger[];
    stockLevels: ProductStock[];
    summary: {
      totalMovements: number;
      stockIns: number;
      stockOuts: number;
      netChange: number;
    };
  };

  // Validation
  validateStockMovement: (
    productId: number,
    quantity: number,
    movementType: MovementType,
  ) => {
    valid: boolean;
    error?: string;
  };

  // Reset
  reset: () => void;
}

const initialState = {
  productLedger: [],
  productStock: [],
  currentLedgerEntry: null,
  currentStock: null,
  loading: false,
  error: null,
  ledgerFilters: {},
  stockFilters: {},
  ledgerPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  stockPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  ...initialState,

  // State setters
  setProductLedger: (ledger) => set({ productLedger: ledger }),
  setProductStock: (stock) => set({ productStock: stock }),
  setCurrentLedgerEntry: (entry) => set({ currentLedgerEntry: entry }),
  setCurrentStock: (stock) => set({ currentStock: stock }),
  addLedgerEntry: (entry) =>
    set((state) => ({
      productLedger: [entry, ...state.productLedger],
    })),
  updateStock: (stock) =>
    set((state) => ({
      productStock: state.productStock.map((s) =>
        s.productId === stock.productId ? stock : s,
      ),
      currentStock:
        state.currentStock?.productId === stock.productId
          ? stock
          : state.currentStock,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLedgerFilters: (filters) =>
    set((state) => ({
      ledgerFilters: { ...state.ledgerFilters, ...filters },
    })),
  setStockFilters: (filters) =>
    set((state) => ({
      stockFilters: { ...state.stockFilters, ...filters },
    })),
  clearLedgerFilters: () => set({ ledgerFilters: {} }),
  clearStockFilters: () => set({ stockFilters: {} }),
  setLedgerPagination: (pagination) =>
    set((state) => ({
      ledgerPagination: { ...state.ledgerPagination, ...pagination },
    })),
  setStockPagination: (pagination) =>
    set((state) => ({
      stockPagination: { ...state.stockPagination, ...pagination },
    })),

  // API Actions - Ledger
  fetchProductLedger: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetchApi.getTable("productledgers");
      const productLedger = Array.isArray(response.data) ? response.data : [];
      set({ productLedger });
      if (!productLedger.length) {
        set({ error: response.message || "No product ledger found" });
      }
    } catch (error) {
      set({ error: "Network error while fetching product ledger" });
      console.error("Fetch product ledger error:", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchLedgerByProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      let productLedger = get().productLedger;
      if (!productLedger.length) {
        const response = await fetchApi.getTable("productledgers");
        productLedger = Array.isArray(response.data) ? response.data : [];
      }
      const filtered = productLedger.filter((entry: any) => entry.productId === productId);
      set({ productLedger: filtered });
      if (!filtered.length) set({ error: "No ledger entries for this product" });
    } catch (error) {
      set({ error: "Network error while fetching product ledger" });
      console.error("Fetch ledger by product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // API Actions - Stock
  fetchProductStock: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetchApi.getTable("productstocks");
      const productStock = Array.isArray(response.data) ? response.data : [];
      set({ productStock });
      if (!productStock.length) {
        set({ error: response.message || "No product stock found" });
      }
    } catch (error) {
      set({ error: "Network error while fetching product stock" });
      console.error("Fetch product stock error:", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchStockByProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      let productStock = get().productStock;
      if (!productStock.length) {
        const response = await fetchApi.getTable("productstocks");
        productStock = Array.isArray(response.data) ? response.data : [];
      }
      const stock = productStock.find((s: any) => s.productId === productId) || null;
      set({ currentStock: stock });
      if (!stock) set({ error: "No stock for this product" });
    } catch (error) {
      set({ error: "Network error while fetching product stock" });
      console.error("Fetch stock by product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Remove all create/update/delete/adjust/record/transfer actions (not supported by backend)
  createLedgerEntry: async () => null,
  updateProductStock: async () => null,
  adjustStock: async () => false,
  recordStockIn: async () => false,
  recordStockOut: async () => false,
  transferStock: async () => false,

  // Utility functions - Ledger
  getLedgerByMovementType: (type) => {
    return get().productLedger.filter((entry) => entry.movementType === type);
  },

  getLedgerByProduct: (productId) => {
    return get().productLedger.filter((entry) => entry.productId === productId);
  },

  getLedgerByReference: (referenceType, referenceId) => {
    return get().productLedger.filter(
      (entry) =>
        entry.referenceType === referenceType &&
        entry.referenceId === referenceId,
    );
  },

  searchLedger: (query) => {
    const ledger = get().productLedger;
    const lowerQuery = query.toLowerCase();
    return ledger.filter(
      (entry) =>
        entry.product.name.toLowerCase().includes(lowerQuery) ||
        entry.referenceType?.toLowerCase().includes(lowerQuery) ||
        entry.movementType.toLowerCase().includes(lowerQuery),
    );
  },

  getLedgerCount: () => {
    return get().productLedger.length;
  },

  getMovementsSummary: () => {
    const ledger = get().productLedger;
    const totalIn = ledger
      .filter((entry) => entry.movementType === MovementType.IN)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    const totalOut = ledger
      .filter((entry) => entry.movementType === MovementType.OUT)
      .reduce((sum, entry) => sum + entry.quantity, 0);

    return {
      totalIn,
      totalOut,
      netMovement: totalIn - totalOut,
    };
  },

  getRecentMovements: (limit = 10) => {
    return get()
      .productLedger.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  },

  // Utility functions - Stock
  getStockByProduct: (productId) => {
    return (
      get().productStock.find((stock) => stock.productId === productId) || null
    );
  },

  getLowStockItems: (threshold = 10) => {
    return get().productStock.filter(
      (stock) => stock.quantity <= threshold && stock.quantity > 0,
    );
  },

  getOutOfStockItems: () => {
    return get().productStock.filter((stock) => stock.quantity === 0);
  },

  searchStock: (query) => {
    const stock = get().productStock;
    const lowerQuery = query.toLowerCase();
    return stock.filter((item) =>
      item.product.name.toLowerCase().includes(lowerQuery),
    );
  },

  getStockCount: () => {
    return get().productStock.length;
  },

  getTotalStockValue: () => {
    // This would need product pricing to calculate actual value
    // For now, return total quantity across all products
    return get().productStock.reduce(
      (total, stock) => total + stock.quantity,
      0,
    );
  },

  getStockSummary: () => {
    const stock = get().productStock;
    return {
      totalItems: stock.length,
      totalQuantity: stock.reduce((sum, item) => sum + item.quantity, 0),
      lowStockCount: get().getLowStockItems().length,
      outOfStockCount: get().getOutOfStockItems().length,
    };
  },

  // Analysis Functions
  getInventoryTurnover: (productId, days) => {
    const movements = get()
      .getLedgerByProduct(productId)
      .filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return (
          entryDate >= cutoffDate && entry.movementType === MovementType.OUT
        );
      });

    const totalOut = movements.reduce((sum, entry) => sum + entry.quantity, 0);
    const currentStock = get().getStockByProduct(productId);
    const avgStock = currentStock?.quantity || 0;

    return avgStock > 0 ? totalOut / avgStock : 0;
  },

  getMovementHistory: (productId, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return get()
      .getLedgerByProduct(productId)
      .filter((entry) => new Date(entry.createdAt) >= cutoffDate)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  getStockLevels: () => {
    const stock = get().productStock;
    return stock.map((stockItem) => ({
      product: stockItem.product,
      currentStock: stockItem.quantity,
      movements: get().getLedgerByProduct(stockItem.productId),
    }));
  },

  getInventoryReport: (dateFrom, dateTo) => {
    const movements = get().productLedger.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= dateFrom && entryDate <= dateTo;
    });

    const stockIns = movements
      .filter((entry) => entry.movementType === MovementType.IN)
      .reduce((sum, entry) => sum + entry.quantity, 0);

    const stockOuts = movements
      .filter((entry) => entry.movementType === MovementType.OUT)
      .reduce((sum, entry) => sum + entry.quantity, 0);

    return {
      movements,
      stockLevels: get().productStock,
      summary: {
        totalMovements: movements.length,
        stockIns,
        stockOuts,
        netChange: stockIns - stockOuts,
      },
    };
  },

  // Validation
  validateStockMovement: (productId, quantity, movementType) => {
    if (quantity <= 0) {
      return { valid: false, error: "Quantity must be greater than 0" };
    }

    if (movementType === MovementType.OUT) {
      const currentStock = get().getStockByProduct(productId);
      if (!currentStock || currentStock.quantity < quantity) {
        return { valid: false, error: "Insufficient stock for this operation" };
      }
    }

    return { valid: true };
  },

  // Reset store
  reset: () => set(initialState),
}));
