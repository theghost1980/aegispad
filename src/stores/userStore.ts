import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserType = "user" | "premium";

interface UserState {
  username: string | null;
  isLoggedIn: boolean;
  type: UserType;
  login: (username: string, type: UserType) => void;
  logout: () => void;
  upgradeToPremium: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      isLoggedIn: false,
      type: "user",
      login: (username, type) => set({ username, isLoggedIn: true, type }),
      logout: () => set({ username: null, isLoggedIn: false, type: "user" }),
      upgradeToPremium: () => set((state) => ({ ...state, type: "premium" })),
    }),
    {
      name: "user-storage",
    }
  )
);
