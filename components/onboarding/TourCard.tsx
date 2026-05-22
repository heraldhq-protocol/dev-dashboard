"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { CardComponentProps, Step } from "nextstepjs";
import { useNextStep } from "nextstepjs";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";

// Extend Step with our custom group fields
type GroupedStep = Step & {
  group?: string;
  groupStep?: number;
  groupTotal?: number;
};

// Section map — one entry per group, ordered to match step indices.
// Used for the breadcrumb trail replacing the 36-dot strip.
const TOUR_SECTIONS = [
  { icon: "👋", label: "Start",   from: 0,  to: 0  },
  { icon: "📊", label: "Overview",      from: 1,  to: 5  },
  { icon: "🧪", label: "Playground",    from: 6,  to: 9  },
  { icon: "🔑", label: "API Keys",      from: 10, to: 14 },
  { icon: "⚡", label: "Webhooks",      from: 15, to: 17 },
  { icon: "📝", label: "Templates",     from: 18, to: 20 },
  { icon: "🌐", label: "Domains",       from: 21, to: 23 },
  { icon: "🔔", label: "Notifs",        from: 24, to: 26 },
  { icon: "💳", label: "Billing",       from: 27, to: 30 },
  { icon: "👥", label: "Team",          from: 31, to: 33 },
  { icon: "⚙️", label: "Settings",     from: 34, to: 34 },
  { icon: "🚀", label: "Done!",         from: 35, to: 35 },
];

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const { setCurrentStep, closeNextStep } = useNextStep() as ReturnType<typeof useNextStep> & {
    closeNextStep?: () => void;
  };
  const { hasUsedKeyboard } = useOnboardingStore();

  if (!step) return null;

  const gs = step as GroupedStep;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const globalFraction = (currentStep + 1) / totalSteps;

  // Steps remaining in current group after this step
  const stepsLeftInGroup =
    gs.groupTotal !== undefined && gs.groupStep !== undefined
      ? gs.groupTotal - gs.groupStep
      : 0;
  const canSkipSection = stepsLeftInGroup > 0 && !isLast;

  const handleSkipSection = () => {
    // Jump past all remaining steps in this group to the first step of the next group
    setCurrentStep(currentStep + stepsLeftInGroup + 1);
  };

  const currentSectionIdx = TOUR_SECTIONS.findIndex(
    (s) => currentStep >= s.from && currentStep <= s.to
  );

  return (
    // key on the wrapper causes a DOM remount on each step → CSS entry animation fires
    <div
      key={currentStep}
      className={`relative w-[min(320px,calc(100vw-3rem))] rounded-2xl border bg-[#0d1320]/95 backdrop-blur-xl overflow-hidden
        animate-in fade-in zoom-in-95 duration-200
        ${isLast
          ? "border-teal/50 shadow-[0_0_60px_rgba(0,200,150,0.35),0_0_0_1px_rgba(0,200,150,0.15)]"
          : "border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]"
        }`}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 bg-teal/8 blur-3xl pointer-events-none" />

      {/* Completion pulse ring on final step */}
      {isLast && (
        <div className="absolute inset-[-1px] rounded-2xl border border-teal/40 animate-pulse pointer-events-none" />
      )}

      {/* ── Header ── */}
      <div className="relative flex items-start justify-between px-5 pt-5 pb-2 gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          {gs.group && (
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-teal/55 truncate">
              {gs.group}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {gs.icon && <span className="text-sm leading-none">{gs.icon}</span>}
            <span className="text-[10px] font-semibold uppercase tracking-widest text-teal">
              {gs.groupStep !== undefined
                ? `${gs.groupStep} of ${gs.groupTotal}`
                : `Step ${currentStep + 1} of ${totalSteps}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Herald watermark */}
          <div className="flex items-center gap-1 opacity-25">
            <Image src="/logo.svg" alt="Herald" width={12} height={12} />
            <span className="text-[9px] font-bold tracking-wide text-foreground font-heading">
              Herald
            </span>
          </div>

          {/* X — pause tour (close without marking skipped) */}
          <button
            onClick={() => closeNextStep?.()}
            className="text-white/25 hover:text-white/60 transition-colors p-0.5 rounded"
            title="Pause tour (resume later)"
            aria-label="Pause tour"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Global progress bar ── */}
      <div className="relative px-5 mb-3">
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
            style={{ width: `${globalFraction * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-text-dim/60 font-mono tabular-nums">
            {gs.group && gs.groupStep !== undefined
              ? `${gs.group} ${gs.groupStep}/${gs.groupTotal}`
              : ""}
          </span>
          <span className="text-[9px] text-teal/40 font-mono tabular-nums">
            {Math.round(globalFraction * 100)}%
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative px-5 pb-2">
        <h3 className="text-sm font-extrabold text-foreground font-heading tracking-tight mb-1.5 leading-snug">
          {step.title}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
          {step.content as string}
        </p>
      </div>

      {/* ── Section breadcrumb — one dot per section ── */}
      <div className="flex items-center justify-center gap-1 py-3 px-5 flex-wrap">
        {TOUR_SECTIONS.map((sec, idx) => {
          const isActive = idx === currentSectionIdx;
          const isDone = idx < currentSectionIdx;
          return (
            <div
              key={sec.label}
              title={sec.label}
              className={`relative flex items-center justify-center rounded-full text-[9px] leading-none transition-all duration-300 cursor-default select-none
                ${isActive
                  ? "w-6 h-6 bg-teal/20 border border-teal text-teal"
                  : isDone
                  ? "w-4 h-4 bg-teal/25 border border-teal/30 text-teal/60"
                  : "w-4 h-4 bg-white/4 border border-white/8 text-white/20"
                }`}
            >
              {isActive ? sec.icon : isDone ? "✓" : "·"}
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div className="relative flex flex-col gap-2 px-5 pb-4">
        {/* Primary row: Back + Next */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={prevStep}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-white/8 text-text-secondary hover:text-foreground hover:border-white/20 transition-all shrink-0"
            >
              ← Back
            </button>
          )}

          <button
            onClick={nextStep}
            className="px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all flex-1 bg-teal text-navy hover:brightness-110 shadow-[0_0_14px_rgba(0,200,150,0.2)] hover:shadow-[0_0_22px_rgba(0,200,150,0.38)]"
          >
            {isLast ? "Start building →" : isFirst ? "Take the tour →" : "Next →"}
          </button>
        </div>

        {/* Secondary row: Skip section + Skip tour */}
        {!isLast && (
          <div className="flex items-center justify-between">
            {canSkipSection ? (
              <button
                onClick={handleSkipSection}
                className="text-[10px] text-text-dim hover:text-text-muted transition-colors"
              >
                Skip {gs.group} →
              </button>
            ) : (
              <span />
            )}

            {step.showSkip && skipTour && (
              <button
                onClick={skipTour}
                className="text-[10px] text-text-dim/60 hover:text-text-dim transition-colors"
              >
                Skip tour
              </button>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hint — hidden once the user has pressed an arrow key */}
      {!hasUsedKeyboard && (
        <div className="flex justify-center pb-3">
          <span className="text-[9px] text-white/20 font-mono tracking-widest select-none">
            ← → arrow keys · Esc to pause
          </span>
        </div>
      )}

      {/* Arrow pointer rendered by NextStep */}
      {arrow}
    </div>
  );
}
