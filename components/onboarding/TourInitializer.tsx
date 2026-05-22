"use client";

import { useEffect, useRef } from "react";
import { useNextStep } from "nextstepjs";
import { usePathname, useRouter } from "next/navigation";
import { useOnboardingStore, TOUR_VERSION } from "@/lib/stores/onboarding.store";
import { useUiStore } from "@/lib/stores/ui.store";
import { HERALD_TOUR_STEP_COUNT } from "@/components/providers/OnboardingTourProvider";

// Steps that target a sidebar nav item — sidebar must be expanded on desktop
const SIDEBAR_STEPS = new Set([1, 6, 10, 15, 18, 21, 24, 27, 31, 34]);

// ── Module-level flag ─────────────────────────────────────────────────────────
// useRef resets on every unmount (navigation causes DashboardShell to remount).
// A module-level variable persists for the entire browser session regardless of
// how many times the component mounts/unmounts, preventing re-fire on navigation.
let _tourSessionFired = false;

/**
 * Maps each step index in heraldMainTour to the pathname where its target
 * element lives. Steps with `selector: undefined` are modal-only and render
 * fine anywhere — omit them so the route guard skips navigation for those steps.
 *
 * IMPORTANT: keep this in sync with the step order in OnboardingTourProvider.
 */
const STEP_ROUTES: Record<number, string> = {
  // Getting Started (modal — any page is fine)
  0: "/overview",
  // Overview
  1: "/overview",  // sidebar-overview
  2: "/overview",  // overview-status-strip
  3: "/overview",  // overview-metrics
  4: "/overview",  // overview-volume-chart
  5: "/overview",  // overview-failures
  // Playground
  6: "/playground", // sidebar-playground
  7: "/playground", // playground-channel-toggle
  8: "/playground", // playground-composer
  9: "/playground", // playground-send-btn
  // API Keys
  10: "/api-keys",  // sidebar-api-keys
  11: "/api-keys",  // apikeys-security-banner
  12: "/api-keys",  // apikeys-live-section
  13: "/api-keys",  // apikeys-test-section
  14: "/api-keys",  // create-api-key-btn
  // Webhooks
  15: "/webhooks",  // sidebar-webhooks
  16: "/webhooks",  // webhooks-list
  17: "/webhooks",  // webhooks-add-btn
  // Templates
  18: "/templates", // sidebar-templates
  19: "/templates", // templates-list
  20: "/templates", // templates-create-btn
  // Domains
  21: "/domains",   // sidebar-domains
  22: "/domains",   // domains-list
  23: "/domains",   // domains-add-btn
  // Notifications
  24: "/notifications", // sidebar-notifications
  25: "/notifications", // notifications-filters
  26: "/notifications", // notifications-table
  // Billing
  27: "/billing",   // sidebar-billing
  28: "/billing",   // billing-current-plan
  29: "/billing",   // billing-plans
  30: "/billing",   // billing-overage
  // Team
  31: "/team",      // sidebar-team
  32: "/team",      // team-members-table
  33: "/team",      // team-invite-btn
  // Step 34 (Settings sidebar) is present on every page — no route required
  // Done modal — bring user back to overview for a clean finish
  35: "/overview",
};

/**
 * TourInitializer — invisible component mounted inside DashboardShell.
 *
 * Responsibilities:
 *  1. Auto-fires the tour once per browser session (or when version bumped).
 *  2. Resumes from the last saved step if the user was mid-tour.
 *  3. ROUTE GUARD: if the tour is active and the current step targets an element
 *     on a different page, this hook navigates there before the card positions.
 *  4. SCROLL RECOVERY: scrolls the target element into view on each step change.
 *  5. SIDEBAR EXPAND: expands a collapsed sidebar when a sidebar step is active.
 *  6. KEYBOARD NAV: ArrowLeft/ArrowRight navigate steps; Escape pauses the tour.
 */
export function TourInitializer() {
  const { startNextStep, closeNextStep, setCurrentStep, currentStep, isNextStepVisible } =
    useNextStep() as ReturnType<typeof useNextStep> & { closeNextStep?: () => void };
  const { tourCompleted, completedTourVersion, lastTourStep, setHasUsedKeyboard } =
    useOnboardingStore();
  const { toggleDesktopSidebar } = useUiStore();
  const pathname = usePathname();
  const router = useRouter();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoExpandedSidebar = useRef(false);

  const shouldFire = !tourCompleted || completedTourVersion < TOUR_VERSION;
  const shouldResume = shouldFire && lastTourStep > 0;

  // ── 1. Auto-start / resume ───────────────────────────────────────────────
  useEffect(() => {
    // Skip tour on mobile — the provider doesn't render NextStep on small screens
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (!shouldFire || _tourSessionFired) return;
    _tourSessionFired = true;

    const startTimer = setTimeout(() => {
      startNextStep("heraldMainTour");

      if (shouldResume) {
        setTimeout(() => {
          setCurrentStep(lastTourStep);
        }, 400);
      }
    }, 1200);

    return () => clearTimeout(startTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Route guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isNextStepVisible) return;

    const requiredRoute = STEP_ROUTES[currentStep];
    if (!requiredRoute) return;

    const alreadyThere = pathname === requiredRoute || pathname.startsWith(requiredRoute + "/");
    if (!alreadyThere) {
      router.push(requiredRoute);
    }
  }, [currentStep, isNextStepVisible, pathname, router]);

  // ── 3. Render Guard & Scroll Recovery ────────────────────────────────────
  useEffect(() => {
    if (!isNextStepVisible) return;

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      cancelAnimationFrame(scrollTimerRef.current as unknown as number);
    }

    const stepSelector = _getStepSelector(currentStep);

    if (!stepSelector) {
      document.body.classList.remove("tour-waiting");
      return;
    }

    document.body.classList.add("tour-waiting");

    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout;
    let frameId: number;

    const checkDOM = () => {
      const el = document.querySelector(stepSelector);

      if (el && el.getBoundingClientRect().height > 0) {
        clearTimeout(timeoutId);

        const scrollContainer = document.getElementById("dashboard-scroll-container");
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const inView =
            elRect.top >= containerRect.top + 16 &&
            elRect.bottom <= containerRect.bottom - 16;
          if (!inView) {
            el.scrollIntoView({ behavior: "instant", block: "center" });
          }
        } else {
          el.scrollIntoView({ behavior: "instant", block: "center" });
        }

        window.dispatchEvent(new Event("resize"));

        requestAnimationFrame(() => {
          document.body.classList.remove("tour-waiting");
        });
        return;
      }

      frameId = requestAnimationFrame(checkDOM);
    };

    frameId = requestAnimationFrame(checkDOM);

    timeoutId = setTimeout(() => {
      cancelAnimationFrame(frameId);
      document.body.classList.remove("tour-waiting");
    }, 3000);

    scrollTimerRef.current = timeoutId as unknown as ReturnType<typeof setTimeout>;

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      document.body.classList.remove("tour-waiting");
    };
  }, [currentStep, isNextStepVisible]);

  // ── 4. Sidebar auto-expand ───────────────────────────────────────────────
  // Read fresh state from the store at effect time to avoid stale closure.
  useEffect(() => {
    if (!isNextStepVisible) return;
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    const collapsed = useUiStore.getState().desktopSidebarCollapsed;

    if (SIDEBAR_STEPS.has(currentStep) && collapsed) {
      toggleDesktopSidebar();
      autoExpandedSidebar.current = true;
    } else if (!SIDEBAR_STEPS.has(currentStep) && autoExpandedSidebar.current) {
      // Only collapse if we are the ones who expanded it (still expanded)
      if (!useUiStore.getState().desktopSidebarCollapsed) {
        toggleDesktopSidebar();
      }
      autoExpandedSidebar.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isNextStepVisible]);

  // ── 5. Keyboard navigation ───────────────────────────────────────────────
  useEffect(() => {
    if (!isNextStepVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight" && currentStep < HERALD_TOUR_STEP_COUNT - 1) {
        setHasUsedKeyboard();
        setCurrentStep(currentStep + 1);
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setHasUsedKeyboard();
        setCurrentStep(currentStep - 1);
      } else if (e.key === "Escape") {
        // Pause: close the card without marking the tour as skipped
        closeNextStep?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNextStepVisible, currentStep, setCurrentStep, setHasUsedKeyboard, closeNextStep]);

  return null;
}

/**
 * Maps a step index to its CSS selector string.
 * Must stay in sync with OnboardingTourProvider step order.
 */
const STEP_SELECTORS: Record<number, string> = {
  2: "#overview-status-strip",
  3: "#overview-metrics",
  4: "#overview-volume-chart",
  5: "#overview-failures",
  7: "#playground-channel-toggle",
  8: "#playground-composer",
  9: "#playground-send-btn",
  11: "#apikeys-security-banner",
  12: "#apikeys-live-section",
  13: "#apikeys-test-section",
  14: "#create-api-key-btn",
  16: "#webhooks-list",
  17: "#webhooks-add-btn",
  19: "#templates-list",
  20: "#templates-create-btn",
  22: "#domains-list",
  23: "#domains-add-btn",
  25: "#notifications-filters",
  26: "#notifications-table",
  28: "#billing-current-plan",
  29: "#billing-plans",
  30: "#billing-overage",
  32: "#team-members-table",
  33: "#team-invite-btn",
};

function _getStepSelector(step: number): string | null {
  return STEP_SELECTORS[step] ?? null;
}

/**
 * useTourControls — used by Settings restart button and the checklist.
 */
export function useTourControls() {
  const { startNextStep } = useNextStep();
  const { resetTour } = useOnboardingStore();

  const restartTour = () => {
    resetTour();
    _tourSessionFired = false;
    setTimeout(() => {
      startNextStep("heraldMainTour");
    }, 100);
  };

  return { restartTour };
}
