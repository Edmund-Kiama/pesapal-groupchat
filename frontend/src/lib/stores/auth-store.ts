import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/lib/typings/models";
import { Tokens } from "@/lib/typings/auth-typings";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

const storage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(name);
      }
      return null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(name, value);
      }
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(name);
      }
    } catch {
      // Ignore storage errors
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      logout: () => {
        // Clear persisted storage
        storage.removeItem("auth-storage");
        // Reset state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);
