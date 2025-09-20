import { create } from "zustand";
import { productApi } from "@/app/lib/api";
import {
  Product,
  ProductFilters,
  ApiResponse,
  PaginatedResponse,
} from "@/app/types";

interface ProductStore {
  // State
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setPagination: (
    pagination: Partial<ProductStore["pagination"]>,
  ) => void;

  // API Actions
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;

  // Utility Actions
  getProductsByUnit: (unit: string) => Product[];
  searchProducts: (query: string) => Promise<Product[]>;
  getProductsWithStock: () => Product[];
  getProductsWithBOM: () => Product[];
  getProductsCount: () => number;

  // Reset
  reset: () => void;
}

const initialState = {
  products: [],
  currentProduct: null,
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

export const useProductStore = create<ProductStore>((set, get) => ({
  ...initialState,

  // State setters
  setProducts: (products) => set({ products }),
  setCurrentProduct: (product) => set({ currentProduct: product }),
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
      currentProduct:
        state.currentProduct?.id === product.id
          ? product
          : state.currentProduct,
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      currentProduct:
        state.currentProduct?.id === id ? null : state.currentProduct,
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
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productApi.getAll();
      const products = Array.isArray(response.data) ? response.data : [];
      set({ products });
      if (!products.length) {
        set({ error: response.message || "No products found" });
      }
    } catch (error) {
      set({ error: "Network error while fetching products" });
      console.error("Fetch products error:", error);
    } finally {
      set({ loading: false });
    }
  },
  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      let products = get().products;
      if (!products.length) {
        const response = await productApi.getAll();
        products = Array.isArray(response.data) ? response.data : [];
      }
      const product = (products as Product[]).find((p) => p.id === id) || null;
      set({ currentProduct: product });
      if (!product) set({ error: "Product not found" });
    } catch (error) {
      set({ error: "Network error while fetching product" });
      console.error("Fetch product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Remove createProduct, updateProductById, deleteProduct (not supported by backend)
  createProduct: async () => null,
  updateProductById: async () => null,
  deleteProduct: async () => false,

  // Utility functions
  getProductsByUnit: (unit) => {
    return get().products.filter((product) => product.unit === unit);
  },

  searchProducts: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await productApi.search(query);
      const products = Array.isArray(response.data) ? response.data : [];
      set({ products });
      return products;
    } catch (error) {
      set({ error: "Network error while searching products" });
      console.error("Search products error:", error);
      return [];
    } finally {
      set({ loading: false });
    }
  },

  getProductsWithStock: () => {
    return get().products.filter((product) => product.stock);
  },

  getProductsWithBOM: () => {
    return get().products.filter(
      (product) => product.bom && product.bom.length > 0,
    );
  },

  getProductsCount: () => {
    return get().products.length;
  },

  // Reset store
  reset: () => set(initialState),
}));
