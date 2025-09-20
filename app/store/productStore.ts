import { create } from "zustand";
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
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
  fetchProducts: (
    filters?: ProductFilters,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<Product | null>;
  updateProductById: (data: UpdateProductDto) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;

  // Utility Actions
  getProductsByUnit: (unit: string) => Product[];
  searchProducts: (query: string) => Product[];
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
  fetchProducts: async (filters, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();

      if (filters?.unit) queryParams.append("unit", filters.unit);
      if (filters?.search) queryParams.append("search", filters.search);

      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`/api/products?${queryParams}`);
      const result: ApiResponse<PaginatedResponse<Product>> =
        await response.json();

      if (result.success && result.data) {
        set({
          products: result.data.data,
          pagination: {
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          },
          filters: filters || {},
        });
      } else {
        set({ error: result.error || "Failed to fetch products" });
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
      const response = await fetch(`/api/products/${id}`);
      const result: ApiResponse<Product> = await response.json();

      if (result.success && result.data) {
        set({ currentProduct: result.data });
      } else {
        set({ error: result.error || "Failed to fetch product" });
      }
    } catch (error) {
      set({ error: "Network error while fetching product" });
      console.error("Fetch product error:", error);
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Product> = await response.json();

      if (result.success && result.data) {
        const newProduct = result.data;
        set((state) => ({
          products: [...state.products, newProduct],
        }));
        return newProduct;
      } else {
        set({ error: result.error || "Failed to create product" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while creating product" });
      console.error("Create product error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateProductById: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/products/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Product> = await response.json();

      if (result.success && result.data) {
        const updatedProduct = result.data;
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p,
          ),
          currentProduct:
            state.currentProduct?.id === updatedProduct.id
              ? updatedProduct
              : state.currentProduct,
        }));
        return updatedProduct;
      } else {
        set({ error: result.error || "Failed to update product" });
        return null;
      }
    } catch (error) {
      set({ error: "Network error while updating product" });
      console.error("Update product error:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          currentProduct:
            state.currentProduct?.id === id ? null : state.currentProduct,
        }));
        return true;
      } else {
        set({ error: result.error || "Failed to delete product" });
        return false;
      }
    } catch (error) {
      set({ error: "Network error while deleting product" });
      console.error("Delete product error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Utility functions
  getProductsByUnit: (unit) => {
    return get().products.filter((product) => product.unit === unit);
  },

  searchProducts: (query) => {
    const products = get().products;
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery) ||
        product.unit.toLowerCase().includes(lowerQuery),
    );
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
