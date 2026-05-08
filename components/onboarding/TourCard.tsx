"use client";

import Image from "next/image";
import type { CardComponentProps, Step } from "nextstepjs";
import { useNextStep } from "nextstepjs";

// Extend Step with our custom group fields
type GroupedStep = Step & {
  group?: string;
  groupStep?: number;
  groupTotal?: number;
};

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const { setCurrentStep } = useNextStep();

  // Guard against NextStep calling the card with an undefined step
  // during mount/unmount transitions between steps
  if (!step) return null;

  const gs = step as GroupedStep;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Global progress fraction for the bar
  const globalFraction = (currentStep + 1) / totalSteps;

  // Calculate how many steps are left in the current group so we can skip ahead
  const stepsLeftInGroup =
    gs.groupTotal !== undefined && gs.groupStep !== undefined
      ? gs.groupTotal - gs.groupStep
      : 0;
  const canSkipSection = stepsLeftInGroup > 0 && !isLast;

  const handleSkipSection = () => {
    // Jump to the first step of the next group
    setCurrentStep(currentStep + stepsLeftInGroup);
  };

  return (
    <div
      // Responsive width: max 320px but never wider than viewport − 1.5rem margin on each side
      className="relative w-[min(320px,calc(100vw-3rem))] rounded-2xl border border-white/10 bg-[#0d1320]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 bg-teal/8 blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative flex items-start justify-between px-5 pt-5 pb-2 gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          {/* Group label */}
          {gs.group && (
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-teal/55 truncate">
              {gs.group}
            </span>
          )}
          {/* Icon + step counter */}
          <div className="flex items-center gap-1.5">
            {gs.icon && <span className="text-sm leading-none">{gs.icon}</span>}
            <span className="text-[10px] font-semibold uppercase tracking-widest text-teal">
              {gs.groupStep !== undefined
                ? `${gs.groupStep} of ${gs.groupTotal}`
                : `Step ${currentStep + 1} of ${totalSteps}`}
            </span>
          </div>
        </div>

        {/* Herald watermark */}
        <div className="flex items-center gap-1 opacity-25 shrink-0">
          <Image src="/logo.svg" alt="Herald" width={12} height={12} />
          <span className="text-[9px] font-bold tracking-wide text-foreground font-heading">
            Herald
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="relative px-5 mb-3">
        {/* Track */}
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
            style={{ width: `${globalFraction * 100}%` }}
          />
        </div>
        {/* Percentage */}
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-text-dim/60 font-mono tabular-nums">
            {/* Group progress e.g. "Overview 4/5" */}
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

      {/* ── Dot strip — global position ── */}
      <div className="flex justify-center gap-[3px] py-3 px-5 flex-wrap">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentStep
                ? "w-3 h-1 bg-teal"
                : i < currentStep
                ? "w-1 h-1 bg-teal/30"
                : "w-1 h-1 bg-white/8"
            }`}
          />
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="relative flex flex-col gap-2 px-5 pb-5">
        {/* Primary row: Back + Next */}
        <div className="flex items-center gap-2">
          {/* Back */}
          {!isFirst && (
            <button
              onClick={prevStep}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-white/8 text-text-secondary hover:text-foreground hover:border-white/20 transition-all shrink-0"
            >
              ← Back
            </button>
          )}

          {/* Next / Finish */}
          <button
            onClick={nextStep}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all flex-1
              bg-teal text-navy hover:brightness-110 shadow-[0_0_14px_rgba(0,200,150,0.2)] hover:shadow-[0_0_22px_rgba(0,200,150,0.38)]`}
          >
            {isLast ? "Start building →" : isFirst ? "Take the tour →" : "Next →"}
          </button>
        </div>

        {/* Secondary row: Skip section + Skip tour */}
        {!isLast && (
          <div className="flex items-center justify-between">
            {/* Skip section — jumps to next group */}
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

            {/* Skip entire tour */}
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

      {/* Arrow pointer rendered by NextStep */}
      {arrow}
    </div>
  );
}
