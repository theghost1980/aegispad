import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  username: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  setAuth: (data: {
    username: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      username: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      setAuth: ({ username, accessToken, refreshToken }) =>
        set({ username, accessToken, refreshToken, isLoggedIn: true }),
      logout: () =>
        set({
          username: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
