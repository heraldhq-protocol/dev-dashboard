import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Version stamp ─────────────────────────────────────────────────────────────
// Bump to force the tour to re-fire for ALL users on next login.
export const TOUR_VERSION = 1;

// ── Checklist ─────────────────────────────────────────────────────────────────
export interface ChecklistState {
  /** User clicked "Mark done" on the playground step */
  playgroundUsed: boolean;
  /** User clicked "Mark done" on the docs step */
  docsRead: boolean;
  /** User explicitly dismissed the checklist card */
  checklistDismissed: boolean;
}

// ── Store shape ───────────────────────────────────────────────────────────────
interface OnboardingState {
  /** true once the user completes OR skips the tour */
  tourCompleted: boolean;
  /** true specifically when the user hit "Skip" */
  tourSkipped: boolean;
  /** the tour version at the time of completion — used to detect version bumps */
  completedTourVersion: number;
  /** last step index the user reached — used for mid-tour resume */
  lastTourStep: number;

  /** Manual-check state for checklist items that can't be auto-detected from the API */
  checklist: ChecklistState;

  setTourCompleted: () => void;
  setTourSkipped: () => void;
  setLastTourStep: (step: number) => void;
  /** Resets tour state so it fires again on next render */
  resetTour: () => void;

  setChecklistItem: (key: keyof Omit<ChecklistState, "checklistDismissed">, value: boolean) => void;
  dismissChecklist: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      tourCompleted: false,
      tourSkipped: false,
      completedTourVersion: 0,
      lastTourStep: 0,

      checklist: {
        playgroundUsed: false,
        docsRead: false,
        checklistDismissed: false,
      },

      setTourCompleted: () =>
        set({ tourCompleted: true, tourSkipped: false, completedTourVersion: TOUR_VERSION, lastTourStep: 0 }),

      setTourSkipped: () =>
        set({ tourCompleted: true, tourSkipped: true, completedTourVersion: TOUR_VERSION, lastTourStep: 0 }),

      setLastTourStep: (step: number) => set({ lastTourStep: step }),

      resetTour: () =>
        set({ tourCompleted: false, tourSkipped: false, completedTourVersion: 0, lastTourStep: 0 }),

      setChecklistItem: (key, value) =>
        set((s) => ({ checklist: { ...s.checklist, [key]: value } })),

      dismissChecklist: () =>
        set((s) => ({ checklist: { ...s.checklist, checklistDismissed: true } })),
    }),
    {
      name: "herald-onboarding",
      partialize: (state) => ({
        tourCompleted: state.tourCompleted,
        tourSkipped: state.tourSkipped,
        completedTourVersion: state.completedTourVersion,
        lastTourStep: state.lastTourStep,
        checklist: state.checklist,
      }),
    }
  )
);
