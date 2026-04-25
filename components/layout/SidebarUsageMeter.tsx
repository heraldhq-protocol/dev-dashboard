"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getBillingStatus } from "@/lib/api/billing";
import Link from "next/link";

/**
 * SidebarUsageMeter
 *
 * Upgraded usage tracker for the sidebar:
 * - Segmented progress bar (4 quarters with gaps)
 * - Shimmer skeleton while loading
 * - Color-coded states (teal / gold / red)
 * - Prominent "Upgrade →" CTA when usage is high
 * - Compact layout to leave maximum room for nav items
 */
export function SidebarUsageMeter({ collapsed }: { collapsed: boolean }) {
  const { data: status, isLoading } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
    staleTime: 1000 * 60 * 5,
  });

  if (collapsed) return null;

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="border-t border-border shrink-0 px-4 py-4 space-y-2">
        {/* Label row */}
        <div className="flex items-center justify-between">
          <div className="animate-shimmer h-2.5 w-20 rounded" />
          <div className="animate-shimmer h-2.5 w-8 rounded" />
        </div>
        {/* Bar */}
        <div className="animate-shimmer h-1.5 w-full rounded-full" />
        {/* Count row */}
        <div className="animate-shimmer h-2.5 w-28 rounded" />
      </div>
    );
  }

  if (!status) return null;

  const { sendsThisPeriod, sendsLimit, usagePercent, tierName } = status;
  const pct = Math.min(usagePercent, 100);
  const isWarning = pct >= 80 && pct < 100;
  const isCritical = pct >= 100;

  const barColor = isCritical
    ? "bg-red shadow-[0_0_8px_rgba(214,48,49,0.5)]"
    : isWarning
      ? "bg-gold shadow-[0_0_8px_rgba(232,146,10,0.5)]"
      : "bg-teal shadow-[0_0_8px_rgba(0,200,150,0.5)]";

  const pctColor = isCritical
    ? "text-red"
    : isWarning
      ? "text-gold"
      : "text-teal";

  // ── Segmented bar (4 quarter ticks) ──
  const SEGMENTS = 4;

  return (
    <div className="border-t border-border shrink-0 px-4 py-4 group">
      {/* Label + percentage */}
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-text-muted group-hover:text-text-secondary transition-colors truncate">
          {pct === 0 ? "Free tier: 1,000 notifications/month" : `${tierName} Usage`}
        </span>
        {pct > 0 && (
          <span className={cn("transition-colors shrink-0 ml-2", pctColor)}>
            {Math.round(pct)}%
          </span>
        )}
      </div>

      {/* Segmented progress bar */}
      <Link
        href="/billing"
        className="block rounded-full overflow-hidden hover:opacity-90 transition-opacity"
        title="View billing"
      >
        <div className="relative flex h-1.5 w-full gap-px">
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const segStart = (i / SEGMENTS) * 100;
            const segEnd = ((i + 1) / SEGMENTS) * 100;
            const fillPct = Math.max(
              0,
              Math.min(100, ((pct - segStart) / (segEnd - segStart)) * 100),
            );
            return (
              <div
                key={i}
                className="flex-1 rounded-full overflow-hidden bg-navy border border-border-2"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    pct === 0 ? "bg-teal/10" : fillPct > 0 ? barColor : "",
                  )}
                  style={{ width: pct === 0 ? "100%" : `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </Link>

      {/* Count row */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-text-muted font-mono">
          {sendsThisPeriod.toLocaleString()}
          <span className="text-border-2 mx-0.5">/</span>
          {sendsLimit.toLocaleString()}
        </span>

        {/* Pulsing dot for warning/critical */}
        {(isWarning || isCritical) && (
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-ping shrink-0",
              isCritical ? "bg-red" : "bg-gold",
            )}
          />
        )}
      </div>

      {/* Prominent upgrade CTA */}
      {(isWarning || isCritical) && (
        <Link
          href="/billing"
          className={cn(
            "mt-3 flex items-center justify-between rounded-lg border px-3 py-1.5",
            "text-[10px] font-bold uppercase tracking-wide transition-all duration-200",
            "hover:brightness-110 cursor-pointer",
            isCritical
              ? "border-red/30 bg-red/10 text-red"
              : "border-gold/30 bg-gold/10 text-gold",
          )}
        >
          <span>{isCritical ? "Limit reached" : "Approaching limit"}</span>
          <span>Upgrade →</span>
        </Link>
      )}
    </div>
  );
}
