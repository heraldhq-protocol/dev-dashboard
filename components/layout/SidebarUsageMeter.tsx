"use client";

import { useQuery } from "@tanstack/react-query";
import { getBillingStatus } from "@/lib/api/billing";

/**
 * SidebarUsageMeter
 *
 * Usage tracker for the sidebar:
 * - Shows plan limit (not percentage to avoid anxiety)
 * - Simple progress bar
 * - Loading skeleton
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
      <div className="border-t border-border-2 shrink-0 px-3 py-4 space-y-2">
        <div className="animate-shimmer h-2.5 w-24 rounded" />
        <div className="animate-shimmer h-1.5 w-full rounded-full" />
        <div className="animate-shimmer h-2.5 w-20 rounded" />
      </div>
    );
  }

  if (!status) return null;

  const { sendsLimit, usagePercent, tierName } = status;
  const pct = Math.min(usagePercent, 100);

  // ── Simple bar (no percentage number)
  return (
    <div className="border-t border-border-2 shrink-0 px-3 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {tierName || "Developer (Free)"} Usage
        </span>
      </div>

      <div className="h-1.5 bg-border-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-text-muted mt-2">
        {sendsLimit.toLocaleString()} notifications/month
      </p>
    </div>
  );
}
