"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  loadingScreen: boolean;
  toggleSidebar: () => void;
  setLoadingScreen: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      loadingScreen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLoadingScreen: (value) => set({ loadingScreen: value }),
    }),
    { name: "program-ui-store" }
  )
);

