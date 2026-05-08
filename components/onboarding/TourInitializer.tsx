"use client";

import { useEffect, useRef } from "react";
import { useNextStep } from "nextstepjs";
import { usePathname, useRouter } from "next/navigation";
import { useOnboardingStore, TOUR_VERSION } from "@/lib/stores/onboarding.store";

// ── Module-level flag ─────────────────────────────────────────────────────────
// useRef resets on every unmount (navigation causes DashboardShell to remount).
// A module-level variable persists for the entire browser session regardless of
// how many times the component mounts/unmounts, preventing re-fire on navigation.
let _tourSessionFired = false;

/**
 * Maps each step index in heraldMainTour to the pathname where its target
 * element lives. Sidebar steps (undefined selector on mobile) are skipped
 * because they don't target in-page elements. Steps with `selector: undefined`
 * are modal-only and render fine anywhere.
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
  // Settings + Done (sidebar/modal — render anywhere)
  34: "/overview",
  35: "/overview",
};

/**
 * TourInitializer — invisible component mounted inside DashboardShell.
 *
 * Responsibilities:
 *  1. Auto-fires the tour once per browser session (or when version bumped).
 *  2. Resumes from the last saved step if the user was mid-tour.
 *  3. ROUTE GUARD: if the tour is active and the current step targets an element
 *     on a different page, this hook navigates there immediately before the card
 *     tries to position itself. This prevents "blind renders" on the wrong page.
 *  4. SCROLL RECOVERY: if the target element is out of view (user scrolled away),
 *     scrolls it back to center on each step change.
 */
export function TourInitializer() {
  const { startNextStep, setCurrentStep, currentStep, isNextStepVisible } = useNextStep();
  const { tourCompleted, completedTourVersion, lastTourStep } = useOnboardingStore();
  const pathname = usePathname();
  const router = useRouter();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldFire = !tourCompleted || completedTourVersion < TOUR_VERSION;
  const shouldResume = shouldFire && lastTourStep > 0;

  // ── 1. Auto-start / resume ───────────────────────────────────────────────
  useEffect(() => {
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
  // If the tour is active and the current step belongs to a different page,
  // navigate there so the target element exists in the DOM.
  useEffect(() => {
    if (!isNextStepVisible) return;

    const requiredRoute = STEP_ROUTES[currentStep];
    if (!requiredRoute) return;

    // Normalize: pathname might be "/overview", requiredRoute is "/overview"
    const alreadyThere = pathname === requiredRoute || pathname.startsWith(requiredRoute + "/");
    if (!alreadyThere) {
      router.push(requiredRoute);
    }
  }, [currentStep, isNextStepVisible, pathname, router]);

  // ── 3. Render Guard & Scroll Recovery ────────────────────────────────────
  // When a step changes (especially cross-page), the new component might not
  // be in the DOM yet. We hide the tour card, poll the DOM until the element
  // is fully rendered, scroll it into view, trigger a recalculation, and
  // then reveal the card perfectly positioned.
  useEffect(() => {
    if (!isNextStepVisible) return;

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      cancelAnimationFrame(scrollTimerRef.current as unknown as number);
    }

    const stepSelector = _getStepSelector(currentStep);
    
    // If no selector (e.g., modal or sidebar step), just ensure it's visible.
    if (!stepSelector) {
      document.body.classList.remove("tour-waiting");
      return;
    }

    // Hide the tour while we wait for the target to mount
    document.body.classList.add("tour-waiting");

    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout;
    let frameId: number;

    const checkDOM = () => {
      const el = document.querySelector(stepSelector);
      
      // If the element exists and has dimensions (is painted)
      if (el && el.getBoundingClientRect().height > 0) {
        clearTimeout(timeoutId);

        // 1. Instantly scroll the container so coordinates are stable
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const inView = rect.top >= 80 && rect.bottom <= viewportH - 32;

        if (!inView) {
          el.scrollIntoView({ behavior: "instant", block: "center" });
        }

        // 2. Force NextStep to recalculate popper positioning
        window.dispatchEvent(new Event("resize"));

        // 3. Reveal the tour card after a tiny paint frame
        requestAnimationFrame(() => {
          document.body.classList.remove("tour-waiting");
        });
        return;
      }

      // Element not ready, check again next frame
      frameId = requestAnimationFrame(checkDOM);
    };

    // Start checking
    frameId = requestAnimationFrame(checkDOM);

    // Failsafe: if element never appears within 3 seconds, unblock the tour
    timeoutId = setTimeout(() => {
      cancelAnimationFrame(frameId);
      document.body.classList.remove("tour-waiting");
    }, 3000);

    // Save timeout so we can clean it up on unmount/re-run
    scrollTimerRef.current = timeoutId as any;

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      document.body.classList.remove("tour-waiting");
    };
  }, [currentStep, isNextStepVisible]);

  return null;
}

/**
 * Maps a step index to its CSS selector string.
 * Must stay in sync with OnboardingTourProvider step order.
 * Only in-page selectors are needed (sidebar steps use sel() which returns
 * the sidebar ID string, and modal steps have no selector).
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
 * useTourControls — used by Settings restart button.
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
