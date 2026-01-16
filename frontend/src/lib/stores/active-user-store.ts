import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/typings/models";

// This store is kept for demo/simulation purposes
// It allows switching between users to simulate different roles
// In production, you'd use the actual auth store

interface ActiveUserState {
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  clearActiveUser: () => void;
}

export const useActiveUserStore = create<ActiveUserState>()(
  persist(
    (set) => ({
      activeUser: null,
      setActiveUser: (user) => set({ activeUser: user }),
      clearActiveUser: () => set({ activeUser: null }),
    }),
    {
      name: "active-user-storage",
    }
  )
);
