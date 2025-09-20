import { create } from "zustand";

type UserState = {
  name: string;
  email: string;
  password: string;
  isLoggedIn: boolean;

  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  login: () => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  name: "",
  email: "",
  password: "",
  isLoggedIn: false,

  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  login: () => set({ isLoggedIn: true }),
  logout: () =>
    set({
      name: "",
      email: "",
      password: "",
      isLoggedIn: false,
    }),
}));
