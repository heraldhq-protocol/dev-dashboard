import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Version stamp ─────────────────────────────────────────────────────────────
// Bump to force the tour to re-fire for ALL users on next login.
export const TOUR_VERSION = 1;

// Total steps in heraldMainTour — kept here to avoid circular imports between
// OnboardingTourProvider (defines steps) and TourInitializer (consumes this count).
export const HERALD_TOUR_STEP_COUNT = 36;

// ── Checklist ─────────────────────────────────────────────────────────────────
export interface ChecklistState {
  /** User clicked "Mark done" on the playground step */
  playgroundUsed: boolean;
  /** User clicked "Mark done" on the CLI step */
  cliUsed: boolean;
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
  /** true once the user has pressed an arrow key — hides the keyboard hint */
  hasUsedKeyboard: boolean;

  /** Manual-check state for checklist items that can't be auto-detected from the API */
  checklist: ChecklistState;

  setTourCompleted: () => void;
  setTourSkipped: () => void;
  setLastTourStep: (step: number) => void;
  setHasUsedKeyboard: () => void;
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
      hasUsedKeyboard: false,

      checklist: {
        playgroundUsed: false,
        cliUsed: false,
        docsRead: false,
        checklistDismissed: false,
      },

      setTourCompleted: () =>
        set({ tourCompleted: true, tourSkipped: false, completedTourVersion: TOUR_VERSION, lastTourStep: 0 }),

      setTourSkipped: () =>
        set({ tourCompleted: true, tourSkipped: true, completedTourVersion: TOUR_VERSION, lastTourStep: 0 }),

      setLastTourStep: (step: number) => set({ lastTourStep: step }),

      setHasUsedKeyboard: () => set({ hasUsedKeyboard: true }),

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
        hasUsedKeyboard: state.hasUsedKeyboard,
        checklist: state.checklist,
      }),
    }
  )
);
