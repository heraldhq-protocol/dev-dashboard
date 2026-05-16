import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  mobileSidebarOpen: boolean;
  desktopSidebarCollapsed: boolean;
  activeEnvironment: "sandbox" | "live";
  theme: "dark" | "light"; // always dark for now
  // Changelog
  isChangelogOpen: boolean;
  lastReadChangelog: string | null; // ISO date string of newest entry the user has seen
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
  setEnvironment: (env: "sandbox" | "live") => void;
  openChangelog: () => void;
  closeChangelog: () => void;
  markChangelogRead: (latestDate: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mobileSidebarOpen: false,
      desktopSidebarCollapsed: false,
      activeEnvironment: "sandbox",
      theme: "dark",
      isChangelogOpen: false,
      lastReadChangelog: null,
      toggleMobileSidebar: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      toggleDesktopSidebar: () =>
        set((state) => ({
          desktopSidebarCollapsed: !state.desktopSidebarCollapsed,
        })),
      setEnvironment: (env) => set({ activeEnvironment: env }),
      openChangelog: () => set({ isChangelogOpen: true }),
      closeChangelog: () => set({ isChangelogOpen: false }),
      markChangelogRead: (latestDate) =>
        set({ lastReadChangelog: latestDate, isChangelogOpen: false }),
    }),
    {
      name: "herald-ui-storage",
      // Only persist fields that should survive page refresh
      partialize: (state) => ({
        desktopSidebarCollapsed: state.desktopSidebarCollapsed,
        activeEnvironment: state.activeEnvironment,
        lastReadChangelog: state.lastReadChangelog,
      }),
    }
  )
);
