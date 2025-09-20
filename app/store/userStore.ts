import { create } from "zustand";

type UserState = {
  email: string;
  password: string;
  fullName: string;
  loginId?: number;
  role: "admin" | "user" | "manager" | "unauthenticated";
  isLoggedIn: boolean;

  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoginId: (loginId: number) => void;
  setRole: (role: "admin" | "user" | "manager" | "unauthenticated") => void;
  login: () => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  email: "",
  password: "",
  isLoggedIn: false,
  role: "unauthenticated",
  fullName: "",
  setName: (fullName) => set({ fullName }),
  setEmail: (email) => set({ email }),
  setLoginId: (loginId) => set({ loginId }),
  setPassword: (password) => set({ password }),
  setRole: (role: "admin" | "user" | "manager" | "unauthenticated") =>
    set({ role }),

  login: () => set({ isLoggedIn: true }),
  logout: () =>
    set({
      fullName: "",
      email: "",
      password: "",
      isLoggedIn: false,
      role: "unauthenticated",
    }),
}));
