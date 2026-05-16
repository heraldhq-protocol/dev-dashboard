"use client";

import { useQuery } from "@tanstack/react-query";
import { getBillingProjection } from "@/lib/api/billing";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-card-2", className)} />
  );
}

export function ProjectedUsageCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["billingProjection"],
    queryFn: getBillingProjection,
    staleTime: 5 * 60 * 1000,
  });

  const usagePercent = data?.usagePercent ?? 0;
  const isWarning = usagePercent >= 70 && usagePercent < 90;
  const isCritical = usagePercent >= 90;

  const barColor = isCritical
    ? "bg-red shadow-[0_0_8px_rgba(239,68,68,0.4)]"
    : isWarning
      ? "bg-gold shadow-[0_0_8px_rgba(245,158,11,0.3)]"
      : "bg-teal shadow-[0_0_8px_rgba(0,200,150,0.25)]";

  const accentText = isCritical
    ? "text-red"
    : isWarning
      ? "text-gold"
      : "text-teal";

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-teal/10 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-teal" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Projected Usage
          </span>
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <span className={cn("text-xs font-bold", accentText)}>
            {data?.usagePercent.toFixed(0)}% used
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-secondary border border-border overflow-hidden">
        {isLoading ? (
          <div className="h-full w-1/3 bg-card-2 animate-pulse rounded-full" />
        ) : (
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              barColor
            )}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
            Sent
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-12 mx-auto mt-1" />
          ) : (
            <p className="text-sm font-bold text-foreground mt-0.5">
              {(data?.currentSends ?? 0).toLocaleString()}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
            Projected
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-14 mx-auto mt-1" />
          ) : (
            <p
              className={cn(
                "text-sm font-bold mt-0.5",
                (data?.projectedOverage ?? 0) > 0 ? "text-gold" : "text-foreground"
              )}
            >
              {(data?.projectedEndOfMonth ?? 0).toLocaleString()}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
            Limit
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-12 mx-auto mt-1" />
          ) : (
            <p className="text-sm font-bold text-foreground mt-0.5">
              {(data?.tierLimit ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Overage warning */}
      {!isLoading && (data?.projectedOverage ?? 0) > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2.5">
          <svg
            className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-[11px] text-gold leading-snug">
            Projected overage:{" "}
            <strong>
              {(data?.projectedOverage ?? 0).toLocaleString()} sends
            </strong>{" "}
            (~$
            {data?.projectedOverageCost?.toFixed(2) ?? "0.00"} USDC)
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-text-muted">
        {isLoading ? (
          <Skeleton className="h-3 w-28" />
        ) : (
          <span>
            {data?.daysRemaining ?? 0} days left in period
            {data?.periodResetAt &&
              ` · resets ${new Date(data.periodResetAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </span>
        )}
        <Link
          href="/billing"
          className="text-teal hover:underline font-semibold"
        >
          Billing →
        </Link>
      </div>
    </div>
  );
}
