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
  fetchProductLedger: (
    filters?: ProductLedgerFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchLedgerByProduct: (productId: number) => Promise<void>;
  createLedgerEntry: (
    data: CreateProductLedgerDto,
  ) => Promise<ProductLedger | null>;

  // API Actions - Stock
  fetchProductStock: (
    filters?: StockFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchStockByProduct: (productId: number) => Promise<void>;
  updateProductStock: (
    productId: number,
    quantity: number,
  ) => Promise<ProductStock | null>;
  adjustStock: (
    productId: number,
    adjustment: number,
    reason: string,
  ) => Promise<boolean>;

  // Inventory Movement Actions
  recordStockIn: (
    productId: number,
    quantity: number,
    referenceType?: string,
    referenceId?: number,
  ) => Promise<boolean>;
  recordStockOut: (
    productId: number,
    quantity: number,
    referenceType?: string,
    referenceId?: number,
  ) => Promise<boolean>;
  transferStock: (
    fromProductId: number,
    toProductId: number,
    quantity: number,
  ) => Promise<boolean>;

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
  fetchProductLedger: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.movementType)
        queryParams.append("movementType", filters.movementType);
      if (filters?.productId)
        queryParams.append("productId", filters.productId.toString());
      if (filters?.referenceType)
        queryParams.append("referenceType", filters.referenceType);
      if (filters?.dateFrom)
        queryParams.append("dateFrom", filters.dateFrom.toISOString());
      if (filters?.dateTo)
        queryParams.append("dateTo", filters.dateTo.toISOString());

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/product-ledger?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<ProductLedger>> =
        await response.json();

      if (result.success && result.data) {
        set({
          productLedger: result.data.data,
          ledgerPagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          ledgerFilters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch product ledger" });
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
      const response = await fetch(
        `/api/product-ledger?productId=${productId}`,
      );
      const result: ApiResponse<ProductLedger[]> = await response.json();

      if (result.success && result.data) {
        set({ productLedger: result.data });
      } else {
        set({ error: result.error || "Failed to fetch product ledger" });
      }
    } catch (error) {
      set({ error: "Network error while fetching product ledger" });
      console.error("Fetch ledger by product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createLedgerEntry: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/product-ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ProductLedger> = await response.json();

      if (result.success && result.data) {
        const newEntry = result.data;
        set((state) => ({
          productLedger: [newEntry, ...state.productLedger],
        }));
        return newEntry;
      } else {
        set({ error: result.error || "Failed to create ledger entry" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating ledger entry" });
      console.error("Create ledger entry error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // API Actions - Stock
  fetchProductStock: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.productId)
        queryParams.append("productId", filters.productId.toString());
      if (filters?.lowStock) queryParams.append("lowStock", "true");
      if (filters?.outOfStock) queryParams.append("outOfStock", "true");
      if (filters?.search) queryParams.append("search", filters.search);

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/product-stock?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<ProductStock>> =
        await response.json();

      if (result.success && result.data) {
        set({
          productStock: result.data.data,
          stockPagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          stockFilters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch product stock" });
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
      const response = await fetch(`/api/product-stock/${productId}`);
      const result: ApiResponse<ProductStock> = await response.json();

      if (result.success && result.data) {
        set({ currentStock: result.data });
      } else {
        set({ error: result.error || "Failed to fetch product stock" });
      }
    } catch (error) {
      set({ error: "Network error while fetching product stock" });
      console.error("Fetch stock by product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateProductStock: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/product-stock/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      const result: ApiResponse<ProductStock> = await response.json();

      if (result.success && result.data) {
        const updatedStock = result.data;
        set((state) => ({
          productStock: state.productStock.map((s) =>
            s.productId === updatedStock.productId ? updatedStock : s,
          ),
          currentStock:
            state.currentStock?.productId === updatedStock.productId
              ? updatedStock
              : state.currentStock,
        }));
        return updatedStock;
      } else {
        set({ error: result.error || "Failed to update product stock" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while updating product stock" });
      console.error("Update product stock error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  adjustStock: async (productId, adjustment, reason) => {
    try {
      const movementType = adjustment > 0 ? MovementType.IN : MovementType.OUT;
      const quantity = Math.abs(adjustment);

      const ledgerEntry = await get().createLedgerEntry({
        movementType,
        quantity,
        productId,
        referenceType: "adjustment",
        referenceId: undefined,
      });

      if (ledgerEntry) {
        // Update stock level
        const currentStock = get().getStockByProduct(productId);
        const newQuantity = (currentStock?.quantity || 0) + adjustment;
        await get().updateProductStock(productId, newQuantity);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Adjust stock error:", error);
      return false;
    }
  },

  // Inventory Movement Actions
  recordStockIn: async (productId, quantity, referenceType, referenceId) => {
    const ledgerEntry = await get().createLedgerEntry({
      movementType: MovementType.IN,
      quantity,
      productId,
      referenceType,
      referenceId,
    });

    if (ledgerEntry) {
      const currentStock = get().getStockByProduct(productId);
      const newQuantity = (currentStock?.quantity || 0) + quantity;
      const updatedStock = await get().updateProductStock(
        productId,
        newQuantity,
      );
      return !!updatedStock;
    }
    return false;
  },

  recordStockOut: async (productId, quantity, referenceType, referenceId) => {
    const validation = get().validateStockMovement(
      productId,
      quantity,
      MovementType.OUT,
    );
    if (!validation.valid) {
      set({ error: validation.error });
      return false;
    }

    const ledgerEntry = await get().createLedgerEntry({
      movementType: MovementType.OUT,
      quantity,
      productId,
      referenceType,
      referenceId,
    });

    if (ledgerEntry) {
      const currentStock = get().getStockByProduct(productId);
      const newQuantity = (currentStock?.quantity || 0) - quantity;
      const updatedStock = await get().updateProductStock(
        productId,
        newQuantity,
      );
      return !!updatedStock;
    }
    return false;
  },

  transferStock: async (fromProductId, toProductId, quantity) => {
    const validation = get().validateStockMovement(
      fromProductId,
      quantity,
      MovementType.OUT,
    );
    if (!validation.valid) {
      set({ error: validation.error });
      return false;
    }

    const outSuccess = await get().recordStockOut(
      fromProductId,
      quantity,
      "transfer",
      toProductId,
    );
    if (outSuccess) {
      const inSuccess = await get().recordStockIn(
        toProductId,
        quantity,
        "transfer",
        fromProductId,
      );
      return inSuccess;
    }
    return false;
  },

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
