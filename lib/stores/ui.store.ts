import { create } from "zustand";

interface UiState {
  mobileSidebarOpen: boolean;
  desktopSidebarCollapsed: boolean;
  activeEnvironment: "sandbox" | "live";
  theme: "dark" | "light"; // always dark for now
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
  setEnvironment: (env: "sandbox" | "live") => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileSidebarOpen: false,
  desktopSidebarCollapsed: false,
  activeEnvironment: "sandbox",
  theme: "dark",
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleDesktopSidebar: () => set((state) => ({ desktopSidebarCollapsed: !state.desktopSidebarCollapsed })),
  setEnvironment: (env) => set({ activeEnvironment: env }),
}));
