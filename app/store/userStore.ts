import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  handleApiError,
} from "@/app/lib/api";
import { authApi } from "@/app/api/authApi";
import { profileApi } from "@/app/api/profileApi";

export interface User {
  id: number;
  email: string;
  name?: string;
  loginId?: string;
  role: "admin" | "manager" | "user";
  createdAt: string;
  updatedAt: string;
}

interface UserStore {
  // State
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;

  // Computed properties
  fullName: string | null;
  email: string | null;
  loginId: string | null;
  userId: number | null;
  role: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Auth Actions
  login: (loginId: string, pwd: string) => Promise<boolean>;
  signup: (loginId: string, pwd: string, name?: string) => Promise<boolean>;
  logout: () => void;

  // Profile Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<boolean>;

  // Utility Actions
  checkAuth: () => void;
  refreshAuth: () => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Computed properties
      get fullName() {
        return get().user?.name || null;
      },
      get email() {
        return get().user?.email || null;
      },
      get loginId() {
        return get().user?.loginId || null;
      },
      get userId() {
        return get().user?.id || null;
      },
      get role() {
        return get().user?.role || null;
      },

      // State setters
      setUser: (user) => {
        set({
          user,
          isLoggedIn: !!user,
        });
      },

      setToken: (token) => {
        set({ token });
        // Do NOT clear token ever, so do not call removeAuthToken()
        if (token) {
          setAuthToken(token);
        }
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Auth Actions
      login: async (loginId, pwd) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login({ loginId, pwd });

          let user = null;
          let token = null;
          if (response.success && response.data) {
            user = (response.data as any).user ?? response.data;
            token = (response.data as any).token ?? null;
          }

          if (user && token) {
            set({
              user,
              isLoggedIn: true,
              loading: false,
            });
            get().setToken(token);
            return true;
          } else {
            set({
              error: response.message || "Login failed",
              loading: false,
            });
            return false;
          }
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            loading: false,
          });
          console.error("Login error:", error);
          return false;
        }
      },

      signup: async (loginId, pwd, name) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.signup({ loginId, pwd, name });

          let user = null;
          let token = null;
          if (response.success && response.data) {
            user = (response.data as any).user ?? response.data;
            token = (response.data as any).token ?? null;
          }

          if (user && token) {
            set({
              user,
              isLoggedIn: true,
              loading: false,
            });
            get().setToken(token);
            return true;
          } else {
            set({
              error: response.message || "Signup failed",
              loading: false,
            });
            return false;
          }
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            loading: false,
          });
          console.error("Signup error:", error);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          error: null,
        });
        removeAuthToken();
      },

      // Profile Actions
      fetchProfile: async () => {
        const token = get().token || getAuthToken();
        if (!token) {
          set({ error: "No authentication token found" });
          return;
        }

        set({ loading: true, error: null });
        try {
          const response = await profileApi.get();

          let user = null;
          if (response.success && response.data) {
            user = (response.data as any).user ?? response.data;
          }

          if (user) {
            set({
              user,
              loading: false,
            });
          } else {
            set({
              error: response.message || "Failed to fetch profile",
              loading: false,
            });
          }
        } catch (error) {
          const errorMessage = handleApiError(error);

          // If unauthorized, logout user
          if (
            errorMessage.includes("401") ||
            errorMessage.includes("unauthorized")
          ) {
            get().logout();
          } else {
            set({
              error: errorMessage,
              loading: false,
            });
          }
          console.error("Fetch profile error:", error);
        }
      },

      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await profileApi.update(data);

          let updatedUser = null;
          if (response.success && response.data) {
            updatedUser = (response.data as any).user ?? response.data;
          }

          if (updatedUser) {
            set({
              user: updatedUser,
              loading: false,
            });
            return true;
          } else {
            set({
              error: response.message || "Failed to update profile",
              loading: false,
            });
            return false;
          }
        } catch (error) {
          const errorMessage = handleApiError(error);
          set({
            error: errorMessage,
            loading: false,
          });
          console.error("Update profile error:", error);
          return false;
        }
      },

      // Utility Actions
      checkAuth: () => {
        const token = getAuthToken();
        const user = get().user;

        if (token && user) {
          set({
            token,
            isLoggedIn: true,
          });
        } else {
          set({
            token: null,
            user: null,
            isLoggedIn: false,
          });
        }
      },

      refreshAuth: async () => {
        const token = getAuthToken();
        if (token) {
          set({ token });
          await get().fetchProfile();
        }
      },

      // Reset
      reset: () => {
        set(initialState);
        removeAuthToken();
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if token is still valid when rehydrating
          state.checkAuth();
        }
      },
    },
  ),
);
