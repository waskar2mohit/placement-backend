import { create } from "zustand";

export const useStore = create((set) => ({
  // 1. STATE
  predictionResult: null,
  isLoading: false,
  error: null,

  // 2. ACTIONS (the functions to change state)
  setIsLoading: (loadingStatus) =>
    set({
      isLoading: loadingStatus,
    }),

  setError: (errorMessage) =>
    set({
      error: errorMessage,
      predictionResult: null,
      isLoading: false,
    }),

  setPredictionResult: (result) =>
    set({
      predictionResult: result,
      error: null,
      isLoading: false,
    }),
}));
