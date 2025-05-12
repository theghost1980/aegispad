import { create } from "zustand";

interface OperationLoadingState {
  isLoading: boolean;
  message: string | null;
  showLoader: (message: string) => void;
  hideLoader: () => void;
}

export const useOperationLoadingStore = create<OperationLoadingState>(
  (set) => ({
    isLoading: false,
    message: null,
    showLoader: (message) => set({ isLoading: true, message }),
    hideLoader: () => set({ isLoading: false, message: null }),
  })
);
