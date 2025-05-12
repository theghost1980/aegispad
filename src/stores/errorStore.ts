import { create } from "zustand";
import type { AppError } from "../types/error";

interface ErrorState {
  error: AppError | null;
  setError: (error: AppError | null) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
