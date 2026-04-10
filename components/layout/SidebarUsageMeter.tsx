"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getBillingStatus } from "@/lib/api/billing";
import Link from "next/link";

/**
 * SidebarUsageMeter
 * 
 * Minimal usage tracker for the sidebar navigation.
 * Only visible when sidebar is expanded.
 */
export function SidebarUsageMeter({ collapsed }: { collapsed: boolean }) {
  const { data: status, isLoading } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
    // Refetch less often for the sidebar meter
    staleTime: 1000 * 60 * 5, 
  });

  if (collapsed) return null;

  if (isLoading) {
    return (
      <div className="border-t border-border mt-auto shrink-0 p-6 animate-pulse">
        <div className="h-2 w-full bg-card rounded-full mb-2" />
        <div className="h-3 w-1/2 bg-card rounded" />
      </div>
    );
  }

  if (!status) return null;

  const { sendsThisPeriod, sendsLimit, usagePercent, tierName } = status;
  const isWarning = usagePercent >= 80 && usagePercent < 100;
  const isCritical = usagePercent >= 100;

  return (
    <div className="border-t border-border mt-auto shrink-0 px-6 py-6 group">
      <div className="mb-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-text-muted group-hover:text-text-secondary transition-colors">
          {tierName} Usage
        </span>
        <span className={cn(
          "transition-colors",
          isCritical ? "text-red" : isWarning ? "text-gold" : "text-teal"
        )}>
          {Math.round(usagePercent)}%
        </span>
      </div>

      <Link href="/billing" className="block relative h-1.5 w-full bg-navy border border-border-2 rounded-full overflow-hidden hover:border-teal/30 transition-colors">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            isCritical ? "bg-red shadow-[0_0_8px_rgba(214,48,49,0.4)]" : 
            isWarning ? "bg-gold shadow-[0_0_8px_rgba(232,146,10,0.4)]" : 
            "bg-teal shadow-[0_0_8px_rgba(0,200,150,0.4)]"
          )}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </Link>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-text-muted font-mono">
          {sendsThisPeriod.toLocaleString()} / {sendsLimit.toLocaleString()}
        </span>
        {(isWarning || isCritical) && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full animate-ping",
            isCritical ? "bg-red" : "bg-gold"
          )} />
        )}
      </div>

      {isCritical && (
        <Link 
          href="/billing" 
          className="mt-3 block text-[9px] font-bold text-red uppercase tracking-tighter hover:underline"
        >
          Limit reached — Upgrade now →
        </Link>
      )}
    </div>
  );
}
