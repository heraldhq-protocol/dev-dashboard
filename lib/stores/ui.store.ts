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
  // Docs drawer
  isDocsOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
  setEnvironment: (env: "sandbox" | "live") => void;
  openChangelog: () => void;
  closeChangelog: () => void;
  markChangelogRead: (latestDate: string) => void;
  openDocs: () => void;
  closeDocs: () => void;
  toggleDocs: () => void;
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
      isDocsOpen: false,
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
      openDocs: () => set({ isDocsOpen: true }),
      closeDocs: () => set({ isDocsOpen: false }),
      toggleDocs: () => set((state) => ({ isDocsOpen: !state.isDocsOpen })),
    }),
    {
      name: "herald-ui-storage",
      partialize: (state) => ({
        desktopSidebarCollapsed: state.desktopSidebarCollapsed,
        activeEnvironment: state.activeEnvironment,
        lastReadChangelog: state.lastReadChangelog,
      }),
    }
  )
);
