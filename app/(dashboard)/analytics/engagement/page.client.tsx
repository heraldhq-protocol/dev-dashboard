"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { EngagementKpiRow } from "@/components/analytics/EngagementKpiRow";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { getEngagementMetrics } from "@/lib/api/analytics";
import { format } from "date-fns";
import { UpgradeGate } from "@/components/billing/UpgradeGate";
import { useUiStore } from "@/lib/stores/ui.store";
import { sandboxEngagementMetrics } from "@/lib/sandbox-data";

export default function EngagementAnalyticsPage() {
  return (
    <UpgradeGate minTier={1} feature="Engagement Analytics" description="Track open rates, click rates, and unsubscribes across your email notifications.">
      <EngagementContent />
    </UpgradeGate>
  );
}

function EngagementContent() {
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  const { data, isLoading } = useQuery({
    queryKey: ["engagementMetrics", isSandbox],
    queryFn: isSandbox ? sandboxEngagementMetrics : () => getEngagementMetrics(),
    staleTime: isSandbox ? 0 : 120_000,
  });

  const periodStr =
    data?.period
      ? `${format(new Date(data.period.from), "MMM d")} – ${format(new Date(data.period.to), "MMM d, yyyy")}`
      : "Last 30 days";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engagement Analytics"
        description="Open rates, click rates, and unsubscribes across your tracked notifications."
        actions={
          <a
            href="/analytics"
            className="text-xs text-text-muted hover:text-foreground transition-colors"
          >
            ← Delivery Analytics
          </a>
        }
      />

      <EngagementKpiRow data={data} isLoading={isLoading} />

      {/* Summary card */}
      <DashboardCard
        header={{
          title: "Engagement Summary",
          action: (
            <span className="text-[10px] text-text-muted">{periodStr}</span>
          ),
        }}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-card-2/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !data || !data.totalSends ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-xl bg-card-2 border border-border flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">No engagement data yet</p>
            <p className="text-xs text-text-muted mt-1">
              Enable engagement tracking in Settings to start collecting open and click data.
            </p>
            <a
              href="/settings"
              className="mt-4 text-xs text-teal hover:underline"
            >
              Go to Settings →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Sends tracked", value: data.totalSends.toLocaleString(), pct: null },
              { label: "Opens", value: data.opens.toLocaleString(), pct: data.openRate },
              { label: "Clicks", value: data.clicks.toLocaleString(), pct: data.clickRate },
              { label: "Unsubscribes", value: data.unsubscribes.toLocaleString(), pct: data.unsubscribeRate },
            ].map(({ label, value, pct }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-text-muted">{label}</span>
                <div className="flex items-center gap-4 tabular-nums">
                  <span className="text-sm font-semibold text-foreground">{value}</span>
                  {pct !== null && (
                    <span className="text-xs text-text-muted w-14 text-right">{pct.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Tracking setup hint */}
      <div className="rounded-xl border border-teal/20 bg-teal/5 p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 h-7 w-7 rounded-lg bg-teal/15 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">How engagement tracking works</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Herald embeds a 1×1 tracking pixel in email notifications to detect opens, and wraps
              links to record clicks. Enable this under{" "}
              <a href="/settings" className="text-teal hover:underline">Settings → Retry &amp; Engagement</a>.
              All tracking data is hashed — no PII is stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
