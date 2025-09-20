// API Configuration and Helper Functions
export const API_CONFIG = {
  BASE_URL: 'http://172.17.54.86:3000/api',
  ENDPOINTS: {
    // Authentication
    AUTH: {
      SIGNUP: '/auth/signup',
      LOGIN: '/auth/login',
    },
    // Profile
    PROFILE: {
      GET: '/profile',
      UPDATE: '/profile',
    },
    // Manufacturing Orders
    MO: {
      NEW: '/mo/new',
      SAVE_DRAFT: '/mo/save-draft',
    },
    // Work Orders
    WO: {
      NEW: '/wo/new',
    },
    // Work Centers
    WORK_CENTERS: {
      NEW: '/workCenters/new',
    },
    // MO Presets
    MO_PRESETS: {
      GET_ALL: '/moPresets',
      GET_BY_ID: '/moPresets',
      CREATE: '/moPresets',
      UPDATE: '/moPresets',
      DELETE: '/moPresets',
    },
    // Fetch Data
    FETCH: {
      TABLES: '/fetch/tables',
      ALL: '/fetch/all',
      TABLE: '/fetch',
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
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Response Error:', error);
    throw error;
  }
};

// Generic API call function
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Authentication API calls
export const authApi = {
  signup: async (data: { loginId: string; pwd: string; name?: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { loginId: string; pwd: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Profile API calls
export const profileApi = {
  get: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.PROFILE.GET);
  },

  update: async (data: { name?: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Manufacturing Order API calls
export const moApi = {
  createNew: async (data: { userId: number }) => {
    return apiCall(API_CONFIG.ENDPOINTS.MO.NEW, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  saveDraft: async (data: {
    id?: number;
    userId: number;
    productId?: number;
    quantity?: number;
    scheduleStartDate?: string;
    deadline?: string;
    assignedToId?: number;
    components?: Array<{ componentId: number; quantity: number }>;
    workOrders?: Array<{
      operation: string;
      assignedToId?: number;
      workCenterId?: number;
    }>;
    status: string;
  }) => {
    return apiCall(API_CONFIG.ENDPOINTS.MO.SAVE_DRAFT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Work Order API calls
export const woApi = {
  create: async (data: {
    moId: number;
    operation: string;
    durationMins: number;
    comments?: string;
    workCenterId?: number;
  }) => {
    return apiCall(API_CONFIG.ENDPOINTS.WO.NEW, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Work Center API calls
export const workCenterApi = {
  create: async (data: {
    name: string;
    location?: string;
    capacityPerHour?: number;
    costPerHour?: number;
    userId: number;
  }) => {
    return apiCall(API_CONFIG.ENDPOINTS.WORK_CENTERS.NEW, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// MO Presets API calls
export const moPresetsApi = {
  getAll: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.MO_PRESETS.GET_ALL);
  },

  getById: async (id: number) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.MO_PRESETS.GET_BY_ID}/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    quantity: number;
    productId: number;
  }) => {
    return apiCall(API_CONFIG.ENDPOINTS.MO_PRESETS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    name?: string;
    description?: string;
    quantity?: number;
    productId?: number;
  }) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.MO_PRESETS.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.MO_PRESETS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Fetch API calls
export const fetchApi = {
  getTables: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.FETCH.TABLES);
  },

  getAll: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.FETCH.ALL);
  },

  getTable: async (tableName: string) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.FETCH.TABLE}/${tableName}`);
  },
};

// Utility function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Utility function to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Utility function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};
