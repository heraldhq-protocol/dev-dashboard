"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { EngagementKpiRow } from "@/components/analytics/EngagementKpiRow";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { getEngagementMetrics } from "@/lib/api/analytics";
import { getTelegramAnalytics } from "@/lib/api/telegram";
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
  const [tgPeriod, setTgPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["engagementMetrics", isSandbox],
    queryFn: isSandbox ? sandboxEngagementMetrics : () => getEngagementMetrics(),
    staleTime: isSandbox ? 0 : 120_000,
  });

  const { data: tgData, isLoading: tgLoading } = useQuery({
    queryKey: ["telegramAnalytics", tgPeriod, isSandbox],
    queryFn: isSandbox
      ? () => ({ period: tgPeriod, subscribers: 0, deliveries: { sent: 0, delivered: 0, failed: 0 }, deliveryRate: 0, clicks: 0, clickRate: 0, topLinks: [] })
      : () => getTelegramAnalytics(tgPeriod),
    staleTime: 60_000,
  });

  const periodStr =
    data?.period
      ? `${format(new Date(data.period.from), "MMM d")} – ${format(new Date(data.period.to), "MMM d, yyyy")}`
      : "Last 30 days";

  // Combined click count across both channels
  const emailClicks = data?.clicks ?? 0;
  const tgClicks = tgData?.clicks ?? 0;
  const totalClicks = emailClicks + tgClicks;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engagement Analytics"
        description="Open rates, click rates, and unsubscribes across all channels."
        actions={
          <a
            href="/analytics"
            className="text-xs text-text-muted hover:text-foreground transition-colors"
          >
            ← Delivery Analytics
          </a>
        }
      />

      <EngagementKpiRow data={data} isLoading={isLoading || tgLoading} tgClicks={tgData?.clicks ?? 0} />

      {/* Channel engagement cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email engagement */}
        <DashboardCard
          header={{
            title: "Email Engagement",
            action: <span className="text-[10px] text-text-muted">{periodStr}</span>,
          }}
        >
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-card-2/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !data || !data.totalSends ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 rounded-xl bg-card-2 border border-border flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">No email tracking data</p>
              <p className="text-xs text-text-muted mt-1">Enable tracking in Settings to see opens and clicks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Tracked sends", value: data.totalSends.toLocaleString(), pct: null, color: "bg-teal" },
                { label: "Opens", value: data.opens.toLocaleString(), pct: data.openRate, color: "bg-teal" },
                { label: "Clicks", value: data.clicks.toLocaleString(), pct: data.clickRate, color: "bg-blue-400" },
                { label: "Unsubscribes", value: data.unsubscribes.toLocaleString(), pct: data.unsubscribeRate, color: "bg-red-400" },
              ].map(({ label, value, pct, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{label}</span>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="font-semibold text-foreground">{value}</span>
                      {pct !== null && (
                        <span className="text-text-muted w-12 text-right">{pct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  {pct !== null && (
                    <div className="h-1.5 w-full bg-card-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Telegram engagement */}
        <DashboardCard
          header={{
            title: "Telegram Engagement",
            action: (
              <div className="flex items-center rounded-lg bg-card-2 border border-border p-0.5 gap-0.5">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTgPeriod(p)}
                    className={`px-2.5 py-0.5 text-[10px] font-medium rounded-md transition-all ${
                      tgPeriod === p ? "bg-card text-foreground shadow-sm" : "text-text-muted hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ),
          }}
        >
          {tgLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-card-2/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : tgData ? (
            <div className="space-y-3">
              {[
                { label: "Subscribers", value: tgData.subscribers.toLocaleString(), pct: null, color: "bg-blue-400" },
                { label: "Delivered", value: tgData.deliveries.delivered.toLocaleString(), pct: tgData.deliveryRate * 100, color: "bg-teal" },
                { label: "Clicks", value: tgData.clicks.toLocaleString(), pct: tgData.clickRate * 100, color: "bg-blue-400" },
                { label: "Failed", value: tgData.deliveries.failed.toLocaleString(), pct: tgData.deliveries.sent > 0 ? (tgData.deliveries.failed / tgData.deliveries.sent) * 100 : 0, color: "bg-red-400" },
              ].map(({ label, value, pct, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{label}</span>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="font-semibold text-foreground">{value}</span>
                      {pct !== null && (
                        <span className="text-text-muted w-12 text-right">{pct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  {pct !== null && (
                    <div className="h-1.5 w-full bg-card-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-foreground">No Telegram data</p>
              <p className="text-xs text-text-muted mt-1">Configure a Telegram bot in Settings to start tracking.</p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Combined click summary */}
      <DashboardCard
        header={{
          title: "Combined Click Summary",
          action: <span className="text-[10px] text-text-muted">email + telegram</span>,
        }}
      >
        {isLoading || tgLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-card-2/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Email clicks", value: emailClicks, color: "bg-teal", icon: "✉" },
              { label: "Telegram clicks", value: tgClicks, color: "bg-blue-400", icon: "✈" },
              { label: "Total clicks", value: totalClicks, color: "bg-purple-400", icon: "↗" },
            ].map(({ label, value, color, icon }) => {
              const pct = totalClicks > 0 ? (value / totalClicks) * 100 : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">{icon}</span>
                      <span className="text-text-muted">{label}</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="font-semibold text-foreground">{value.toLocaleString()}</span>
                      {label !== "Total clicks" && (
                        <span className="text-text-muted w-12 text-right">{pct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  {label !== "Total clicks" && (
                    <div className="h-1.5 w-full bg-card-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
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
              Herald embeds a 1×1 tracking pixel in email notifications to detect opens, and wraps links to record clicks. For Telegram, link clicks are tracked via Herald's redirect endpoint. Enable tracking under{" "}
              <a href="/settings" className="text-teal hover:underline">Settings → Retry &amp; Engagement</a>.
              All tracking data is hashed — no PII is stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
