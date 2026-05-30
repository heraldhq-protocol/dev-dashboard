"use client";

import { DashboardCard } from "@/components/ui/DashboardCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { SendsBarChart } from "@/components/analytics/SendsBarChart";
import { DeliveryStatusDonut } from "@/components/analytics/DeliveryStatusDonut";
import { CategoryBreakdownBars } from "@/components/analytics/CategoryBreakdownBars";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsTrends } from "@/lib/api/analytics";
import { getTelegramAnalytics } from "@/lib/api/telegram";
import { useUiStore } from "@/lib/stores/ui.store";
import { sandboxAnalyticsTrends } from "@/lib/sandbox-data";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const [tgPeriod, setTgPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  const { data, isLoading } = useQuery({
    queryKey: ["analyticsTrends", days, isSandbox],
    queryFn: isSandbox
      ? () => sandboxAnalyticsTrends(days)
      : () => getAnalyticsTrends(days),
  });

  const { data: tgData, isLoading: tgLoading } = useQuery({
    queryKey: ["telegramAnalytics", tgPeriod, isSandbox],
    queryFn: isSandbox
      ? () => ({
          period: tgPeriod,
          subscribers: 0,
          deliveries: { sent: 0, delivered: 0, failed: 0 },
          deliveryRate: 0,
          clicks: 0,
          clickRate: 0,
          topLinks: [],
        })
      : () => getTelegramAnalytics(tgPeriod),
    staleTime: 60_000,
  });

  const totalVolume = data?.totalVolume || 0;
  const delivered = data?.statusBreakdown.find(s => s.status.toLowerCase() === "delivered")?._count?.id || 0;
  const failed = data?.statusBreakdown.find(s => s.status.toLowerCase() === "failed")?._count?.id || 0;

  const dateRangeStr = `${format(subDays(new Date(), days), "MMM d")} – ${format(new Date(), "MMM d")}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics"
        description="Deep dive into your protocol's notification performance."
        actions={
          <div className="flex items-center gap-3">
            <DateRangePicker days={days} setDays={setDays} />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5" onClick={() => alert("Mock export CSV initiated")}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Summary Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Delivered"
          value={isLoading ? "..." : delivered.toLocaleString()}
          delta="—"
          deltaType="neutral"
          detail={`last ${days} days`}
          isLoading={isLoading}
        />
        <MetricCard
          label="Failed"
          value={isLoading ? "..." : failed.toLocaleString()}
          delta="—"
          deltaType="neutral"
          detail={`last ${days} days`}
          isLoading={isLoading}
        />
        <MetricCard
          label="Avg. Latency"
          value="142ms"
          delta="↓ 8ms"
          deltaType="positive"
          detail="p95 response time"
          sparklineData={[180, 160, 150, 148, 145, 142]}
          isLoading={isLoading}
        />
        <MetricCard
          label="Message Volume"
          value={isLoading ? "..." : totalVolume.toLocaleString()}
          delta="—"
          deltaType="neutral"
          detail={`last ${days} days`}
          isLoading={isLoading}
        />
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Message Volume Chart */}
        <DashboardCard
          header={{
            title: "Message Volume",
            action: (
              <div className="flex items-center gap-1 text-[11px] text-[#64748b]">
                <span>{dateRangeStr}</span>
              </div>
            ),
          }}
        >
          <div className="flex items-center rounded-lg bg-card-2 p-1 mb-4">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartType === "bar"
                  ? "bg-card text-foreground"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartType === "area"
                  ? "bg-card text-foreground"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              Area
            </button>
          </div>

          {!isLoading && data ? (
            totalVolume > 0 ? (
              <SendsBarChart
                data={data.dailyVolume || []}
                channelData={data.dailyVolumeByChannel}
                type={chartType}
              />
            ) : (
              <div className="h-[250px] w-full flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-card-2 flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">No notifications sent yet</p>
                  <p className="text-xs text-text-muted mt-1">Send a notification to see volume metrics.</p>
                </div>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => window.location.href = '/playground'}>
                  Send your first notification →
                </Button>
              </div>
            )
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center">
              <div className="animate-shimmer h-full w-full rounded-md opacity-20" />
            </div>
          )}
        </DashboardCard>

        {/* Right Column: Donut + Category */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {/* Delivery Status */}
          <DashboardCard
            header={{
              title: "Delivery Status",
              action: (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success/10 border border-status-success/20 px-2 py-0.5 text-[10px] font-medium text-status-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse" />
                  Live
                </span>
              ),
            }}
          >
            {!isLoading && data ? (
              totalVolume > 0 ? (
                <DeliveryStatusDonut data={data.statusBreakdown || []} />
              ) : (
                <div className="h-[180px] w-full flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-border-2 flex items-center justify-center text-text-muted">
                    <span className="text-[10px] font-medium">0%</span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">No delivery data</p>
                </div>
              )
            ) : (
              <div className="h-[180px] w-full flex items-center justify-center">
                <div className="animate-shimmer h-32 w-32 rounded-full opacity-20" />
              </div>
            )}
          </DashboardCard>

          {/* Category Split */}
          <DashboardCard
            header={{
              title: "Category Split",
              action: (
                <span className="text-[10px] text-text-muted font-mono">
                  by volume
                </span>
              ),
            }}
          >
            {!isLoading && data ? (
              totalVolume > 0 ? (
                <CategoryBreakdownBars data={data.categoryBreakdown || []} />
              ) : (
                <div className="h-[180px] w-full flex flex-col items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <p className="text-xs text-text-muted mt-2">No category data</p>
                </div>
              )
            ) : (
              <div className="h-[180px] w-full flex flex-col gap-4 mt-2">
                <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* ── Telegram Analytics ─────────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-foreground">Telegram Analytics</h2>
          </div>
          <div className="flex items-center rounded-lg bg-card-2 border border-border p-1 gap-0.5">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setTgPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  tgPeriod === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: "Subscribers", value: tgData?.subscribers ?? 0, format: (n: number) => n.toLocaleString() },
            { label: "Delivered", value: tgData?.deliveries.delivered ?? 0, format: (n: number) => n.toLocaleString() },
            { label: "Delivery Rate", value: tgData?.deliveryRate ?? 0, format: (n: number) => `${(n * 100).toFixed(1)}%` },
            { label: "Click Rate", value: tgData?.clickRate ?? 0, format: (n: number) => `${(n * 100).toFixed(2)}%` },
          ].map(({ label, value, format }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
              {tgLoading ? (
                <div className="animate-shimmer h-7 w-20 rounded-md mt-2 opacity-20" />
              ) : (
                <p className="text-2xl font-bold text-foreground mt-1">{format(value)}</p>
              )}
            </div>
          ))}
        </div>

        {/* Delivery breakdown + top links */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Delivery breakdown */}
          <DashboardCard header={{ title: "Delivery Breakdown" }}>
            {tgLoading ? (
              <div className="space-y-3 p-2">
                <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
              </div>
            ) : tgData ? (
              <div className="space-y-3">
                {[
                  { label: "Delivered", value: tgData.deliveries.delivered, color: "bg-teal" },
                  { label: "Failed", value: tgData.deliveries.failed, color: "bg-red-400" },
                ].map(({ label, value, color }) => {
                  const total = tgData.deliveries.sent || 1;
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{label}</span>
                        <span className="font-mono font-medium text-foreground">{value.toLocaleString()} <span className="text-text-muted">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 w-full bg-card-2 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-text-muted pt-2 border-t border-border">
                  {tgData.deliveries.sent.toLocaleString()} total sent in last {tgPeriod}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-8">No Telegram data</p>
            )}
          </DashboardCard>

          {/* Top links */}
          <DashboardCard header={{ title: "Top Clicked Links" }}>
            {tgLoading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                ))}
              </div>
            ) : tgData?.topLinks && tgData.topLinks.length > 0 ? (
              <ol className="space-y-2">
                {tgData.topLinks.map((link, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-mono text-text-muted w-4 shrink-0">{i + 1}</span>
                    <span className="truncate text-text-secondary flex-1" title={link.url ?? ""}>{link.url ?? "—"}</span>
                    <span className="font-mono text-xs text-foreground shrink-0">{link.clicks}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <svg className="w-8 h-8 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-xs text-text-muted">No link clicks tracked yet</p>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}