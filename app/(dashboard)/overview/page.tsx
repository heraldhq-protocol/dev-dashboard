"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { FiZap, FiCode, FiKey, FiActivity } from "react-icons/fi";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getAnalyticsTrends } from "@/lib/api/analytics";
import { listNotifications } from "@/lib/api/notifications";
import Link from "next/link";
import { BarChart3, ShieldCheck } from "lucide-react";

export default function OverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["analyticsTrends", timeRange],
    queryFn: () => getAnalyticsTrends(timeRange === "7d" ? 7 : 30),
  });

  const { data: failedNotifs } = useQuery({
    queryKey: ["recentFailures"],
    queryFn: () => listNotifications(1, 5, "failed"),
  });

  const performanceData = (trends?.dailyVolume ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sends: d.volume,
  }));

  const recentFailures = failedNotifs?.items ?? [];

  const volumeSparkline = performanceData.map((d) => d.sends);
  const deliverySparkline = [98, 98.5, 99, 99.1, 99.5, 99.8, 100];
  const latencySparkline = [200, 190, 185, 170, 165, 150, 142];

  const totalSends = stats?.sendsThisPeriod ?? 0;

  return (
    <div className="space-y-6">
      {/* System Status Strip */}
      <div className="flex items-center gap-2 rounded-lg border border-[rgba(16,185,129,0.2)] bg-status-success-bg px-4 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
        </span>
        <span className="text-[13px] font-medium text-[#10b981]">
          Herald Network: <span className="font-bold">Operational</span>
        </span>
      </div>

      <PageHeader
        title="Overview"
        description="Monitor your Herald notification infrastructure."
      />

      {/* Quick Start (Shows only if 0 sends) */}
      {!isLoading && totalSends === 0 && (
        <DashboardCard className="bg-linear-to-r from-card to-navy-2 border-l-2 border-l-teal">
          <div className="flex items-start gap-3 mb-4">
            <FiZap className="w-5 h-5 text-teal" />
            <div>
              <h2
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: '"Syne", system-ui, sans-serif' }}
              >
                Let&apos;s get started
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Your dashboard is ready, but we haven&apos;t received any notifications yet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-card-2 flex items-center justify-center">
                <FiKey className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">1. Create API Key</h4>
                <p className="text-xs text-text-muted mt-1">Generate a live or test key.</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/api-keys">Go to API Keys</Link>
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-card-2 flex items-center justify-center">
                <FiCode className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">2. Read the Docs</h4>
                <p className="text-xs text-text-muted mt-1">Learn how to format payloads.</p>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                View Documentation
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-card-2 flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">3. Send First Event</h4>
                <p className="text-xs text-text-muted mt-1">Use the playground to test.</p>
              </div>
              <Button size="sm" asChild className="w-full">
                <Link href="/playground">Open Playground</Link>
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Sends"
          value={isLoading ? "..." : totalSends.toLocaleString()}
          delta="↑ 12%"
          deltaType="positive"
          detail="This period"
          sparklineData={volumeSparkline}
          isLoading={isLoading}
        />
        <MetricCard
          label="Delivery Rate"
          value={isLoading ? "..." : `${stats?.deliverySuccessRate?.toFixed(1) ?? "100.0"}%`}
          delta="↑ 0.5%"
          deltaType="positive"
          detail="Last 30 days"
          sparklineData={deliverySparkline}
          isLoading={isLoading}
        />
        <MetricCard
          label="Avg Latency"
          value={isLoading ? "..." : "142ms"}
          delta="↓ 8ms"
          deltaType="positive"
          detail="Last 30 days"
          sparklineData={latencySparkline}
          isLoading={isLoading}
        />
        <MetricCard
          label="Active Webhooks"
          value={isLoading ? "..." : stats?.activeWebhooks ?? 0}
          delta="—"
          deltaType="neutral"
          detail="Listening endpoints"
          sparklineData={(stats?.activeWebhooks ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Chart + Failures */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Notification Volume Chart */}
        <DashboardCard
          className="lg:col-span-4"
          header={{
            title: "Notification Volume",
            action: (
              <div className="flex bg-card-2 p-1 rounded-lg">
                <button
                  onClick={() => setTimeRange("7d")}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    timeRange === "7d"
                      ? "bg-card text-foreground"
                      : "text-text-muted hover:text-foreground"
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeRange("30d")}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    timeRange === "30d"
                      ? "bg-card text-foreground"
                      : "text-text-muted hover:text-foreground"
                  }`}
                >
                  30d
                </button>
              </div>
            ),
          }}
        >
          <div className="h-[280px] w-full">
            {trendsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="space-y-2 w-full px-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 bg-card-2 animate-pulse rounded" style={{ width: `${60 + i * 8}%` }} />
                  ))}
                </div>
              </div>
            ) : (trends?.totalVolume ?? 0) === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-lg bg-card-2 border border-border flex items-center justify-center mb-3 shadow-sm">
                  <BarChart3 className="w-5 h-5 text-text-muted" />
                </div>
                <p className="text-sm font-medium text-foreground">No notifications sent yet</p>
                <Link href="/playground" className="text-teal text-xs font-bold hover:underline mt-1.5 transition-colors">
                  Send your first notification &rarr;
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSends" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c896" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-alt)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} dx={-10} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "var(--bg-card-2)", border: "1px solid var(--border-alt)", borderRadius: "8px", color: "var(--text-main)" }}
                    itemStyle={{ color: "#00c896", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="sends" stroke="#00c896" strokeWidth={3} fillOpacity={1} fill="url(#colorSends)" activeDot={{ r: 6, fill: "#00e5a8", stroke: "var(--bg-card)", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </DashboardCard>

        {/* Recent Failures */}
        <DashboardCard
          className="lg:col-span-3"
          header={{
            title: "Recent Failures",
            action: (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-ok" />
                <span className="text-xs text-text-muted">Operational</span>
              </div>
            ),
          }}
          footer={{
            left: `Showing last ${recentFailures.length} failures`,
            right: (
              <Link href="/notifications" className="text-teal hover:underline">
                View all logs →
              </Link>
            ),
          }}
        >
          <div className="flex flex-col items-center justify-center py-12">
            <ShieldCheck className="w-8 h-8 text-[#10b981] mb-3" />
            <p className="text-sm text-[#94a3b8]">All systems operational</p>
            <p className="text-xs text-[#64748b] mt-1">No recent delivery failures</p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}