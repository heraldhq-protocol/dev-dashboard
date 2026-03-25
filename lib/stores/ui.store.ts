import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  activeEnvironment: "sandbox" | "live";
  theme: "dark" | "light"; // always dark for now
  toggleSidebar: () => void;
  setEnvironment: (env: "sandbox" | "live") => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  activeEnvironment: "sandbox",
  theme: "dark",
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setEnvironment: (env) => set({ activeEnvironment: env }),
}));
