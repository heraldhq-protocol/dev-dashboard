"use client";

import { Lock, ArrowUpRight } from "lucide-react";

interface Props {
  feature: string;
  description: string;
  currentTierName?: string;
  requiredTier?: string;
}

export function TierGatePage({
  feature,
  description,
  currentTierName,
  requiredTier = "Growth",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-amber-400" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">{feature}</h2>
      <p className="text-sm text-text-muted max-w-sm mb-1">{description}</p>

      {currentTierName && (
        <p className="text-xs text-amber-400/80 mt-2 mb-6">
          You&apos;re on the{" "}
          <span className="font-semibold">{currentTierName}</span> plan.
          Upgrade to <span className="font-semibold">{requiredTier}</span> or higher to unlock this feature.
        </p>
      )}

      <a
        href="/billing"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
      >
        View Plans
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
