// API Configuration and Helper Functions
export const API_CONFIG = {
  BASE_URL: "http://172.17.54.86:3000/api",
  ENDPOINTS: {
    // Authentication
    AUTH: {
      SIGNUP: "/auth/signup",
      LOGIN: "/auth/login",
    },
    // Profile
    PROFILE: {
      GET: "/profile",
      UPDATE: "/profile",
    },
    // Manufacturing Orders
    MO: {
      NEW: "/mo/new",
      SAVE_DRAFT: "/mo/save-draft",
    },
    // Work Orders
    WO: {
      NEW: "/wo/new",
    },
    // Work Centers
    WORK_CENTERS: {
      NEW: "/workCenters/new",
    },
    // MO Presets
    MO_PRESETS: {
      GET_ALL: "/moPresets",
      GET_BY_ID: "/moPresets",
      CREATE: "/moPresets",
      UPDATE: "/moPresets",
      DELETE: "/moPresets",
    },
    // Fetch Data
    FETCH: {
      TABLES: "/fetch/tables",
      ALL: "/fetch/all",
      TABLE: "/fetch",
    },
    // Products
    PRODUCTS: {
      GET_ALL: "/products",
      GET_BY_ID: "/products",
      SEARCH: "/products/search",
      GET_LOW_STOCK: "/products/low-stock",
      CREATE: "/products",
      UPDATE: "/products",
      DELETE: "/products",
    },
    // Stock
    STOCK: {
      GET_ALL: "/stock",
      GET_BY_ID: "/stock",
      LEDGER: "/stock/ledger",
      LOW_STOCK: "/stock/low-stock",
      MOVEMENT: "/stock/movement",
    },
  },
};

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  status?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleApiResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Response Error:", error);
    throw error;
  }
};

// Generic API call function
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    // console.log(config)
    const response = await fetch(url, config);
    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Utility function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

// Utility function to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

// Utility function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};
