"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
import { FiAlertTriangle, FiActivity, FiZap, FiCode, FiKey } from "react-icons/fi";
import { FaCopy } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getAnalyticsTrends } from "@/lib/api/analytics";
import { listNotifications } from "@/lib/api/notifications";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";



const categoryColors: Record<string, string> = {
  defi: "text-red bg-red/10 border-red/20",
  governance: "text-purple bg-purple/10 border-purple/20",
  system: "text-gold bg-gold/10 border-gold/20",
  marketing: "text-text-muted bg-card-2 border-border",
};

const statusColors: Record<string, string> = {
  failed: "text-red bg-red/10 border-red/20",
  retrying: "text-gold bg-gold/10 border-gold/20",
};

function FailureRow({
  id,
  wallet,
  category,
  reason,
  ts,
  status,
}: { id: string; wallet: string; category: string; reason: string; ts: string; status: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-border/30 last:border-0">
      {/* Icon */}
      <div className="mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-red/10 border border-red/20">
        <FiAlertTriangle className="h-3.5 w-3.5 text-red" />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reason — primary info */}
          <span className="text-sm font-semibold text-foreground">{reason}</span>
          {/* Category badge */}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              categoryColors[category] ?? categoryColors.marketing
            }`}
          >
            {category}
          </span>
          {/* Status pill */}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              statusColors[status] ?? "text-text-muted bg-card-2 border-border"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Secondary row: ID + wallet */}
        <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
          <button
            onClick={handleCopy}
            className="group/copy inline-flex items-center gap-1 font-mono hover:text-teal transition-colors"
            title="Copy ID"
          >
            <span>{id}</span>
            <FaCopy
              className={`h-3 w-3 transition-all ${
                copied ? "text-teal" : "opacity-0 group-hover/copy:opacity-100"
              }`}
            />
          </button>
          <span className="text-border-2">·</span>
          <span className="font-mono text-teal/80">{wallet}</span>
        </div>
      </div>

      {/* Timestamp + arrow */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="text-[11px] text-text-muted">{ts}</span>
        <FaArrowRight className="h-3.5 w-3.5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

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

  // Sparkline data from trends
  const volumeSparkline = performanceData.map((d) => d.sends);
  const deliverySparkline = [98, 98.5, 99, 99.1, 99.5, 99.8, 100];
  const latencySparkline = [200, 190, 185, 170, 165, 150, 142];

  const totalSends = stats?.sendsThisPeriod ?? 0;

  return (
    <div className="space-y-6">
      {/* System Status Strip */}
      <div className="flex items-center gap-2 rounded-lg border border-teal/20 bg-teal/5 px-4 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
        </span>
        <span className="text-[13px] font-medium text-teal">
          Herald Network: <span className="font-bold">Operational</span>
        </span>
      </div>

      <PageHeader
        title="Overview"
        description="Monitor your Herald notification infrastructure."
      />

      {/* Quick Start (Shows only if 0 sends) */}
      {!isLoading && totalSends === 0 && (
        <Card variant="glow" className="overflow-hidden border-teal/20 bg-linear-to-br from-card to-teal/5">
          <CardContent className="p-6 sm:p-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <FiZap className="text-gold" /> Let's get started
              </h2>
              <p className="text-sm text-text-muted mb-6">
                Your dashboard is ready, but we haven't received any notifications yet. Follow these steps to start sending.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-card-2 border border-border rounded-lg p-4 transition-all duration-200 hover:border-border-2 hover:-translate-y-px hover:shadow-(--card-glow-hover) group">
                  <div className="h-8 w-8 rounded-full bg-navy border border-border flex items-center justify-center mb-3">
                    <FiKey className="text-teal w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-teal transition-colors">1. Create API Key</h3>
                  <p className="text-xs text-text-muted mb-3">Generate a live or test key to authenticate requests.</p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/api-keys">Go to API Keys</Link>
                  </Button>
                </div>
                
                <div className="bg-card-2 border border-border rounded-lg p-4 transition-all duration-200 hover:border-border-2 hover:-translate-y-px hover:shadow-(--card-glow-hover) group">
                  <div className="h-8 w-8 rounded-full bg-navy border border-border flex items-center justify-center mb-3">
                    <FiCode className="text-purple w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-purple transition-colors">2. Read the Docs</h3>
                  <p className="text-xs text-text-muted mb-3">Learn how to format payloads and trigger sends.</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Documentation
                  </Button>
                </div>

                <div className="bg-card-2 border border-border rounded-lg p-4 transition-all duration-200 hover:border-border-2 hover:-translate-y-px hover:shadow-(--card-glow-hover) group">
                  <div className="h-8 w-8 rounded-full bg-navy border border-border flex items-center justify-center mb-3">
                    <FiActivity className="text-gold w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-gold transition-colors">3. Send First Event</h3>
                  <p className="text-xs text-text-muted mb-3">Use the playground to test your first notification.</p>
                  <Button variant="default" size="sm" asChild className="w-full">
                    <Link href="/playground">Open Playground</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sends"
          value={isLoading ? "..." : totalSends.toLocaleString()}
          delta="↑ 12%"
          deltaType="positive"
          detail="This period"
          sparklineData={volumeSparkline}
          isLoading={isLoading}
        />
        <StatCard
          label="Delivery Rate"
          value={isLoading ? "..." : `${stats?.deliverySuccessRate?.toFixed(1) ?? "100.0"}%`}
          delta="↑ 0.5%"
          deltaType="positive"
          detail="Last 30 days"
          sparklineData={deliverySparkline}
          isLoading={isLoading}
        />
        <StatCard
          label="Avg Latency"
          value={
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help border-b border-dashed border-text-muted/50 pb-0.5">142ms</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  p95 response time
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          }
          delta="↓ 8ms"
          deltaType="positive"
          detail="Last 30 days"
          sparklineData={latencySparkline}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Webhooks"
          value={isLoading ? "..." : stats?.activeWebhooks ?? 0}
          delta="—"
          deltaType="neutral"
          topRight={(stats?.activeWebhooks ?? 0) === 0 ? (
            <Link href="/webhooks" className="text-teal text-[10px] font-bold hover:underline transition-colors">
              Set up webhooks &rarr;
            </Link>
          ) : undefined}
          detail="Listening endpoints"
          sparklineData={(stats?.activeWebhooks ?? 0) === 0 ? [0,0,0,0,0,0,0] : undefined}
          sparklineColor="#7f91a4"
          isLoading={isLoading}
        />
      </div>

      {/* Chart + Failures */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart */}
        <Card className="lg:col-span-4 flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider text-left">
                Notification Volume
              </CardTitle>
              <div className="mt-2 text-2xl font-bold text-foreground">
                {trendsLoading ? (
                  <span className="text-text-muted text-base">Loading…</span>
                ) : (
                  <>
                    {(trends?.totalVolume ?? 0).toLocaleString()}{" "}
                    <span className="text-sm font-normal text-text-muted">
                      sends in last {timeRange === "7d" ? "7" : "30"} days
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Time range selector */}
            <div className="flex items-center rounded-lg bg-card-2 p-0.5 border border-border">
              {(["7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    timeRange === range
                      ? "bg-card shadow-sm text-foreground"
                      : "text-text-muted hover:text-foreground"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 pl-0 pt-4">
            <div className="h-[280px] w-full min-w-0 pr-4">
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
          </CardContent>
        </Card>

        {/* Recent Failures */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider text-left">Recent Failures</CardTitle>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red/10 border border-red/20 px-2 py-0.5 text-[10px] font-bold text-red uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
                {recentFailures.length}
              </span>
            </div>
            <Link href="/notifications" className="text-teal text-[11px] font-bold hover:underline transition-colors flex items-center gap-1 uppercase tracking-wider">
              View all &rarr;
            </Link>
          </CardHeader>

          <div className="flex-1 flex flex-col py-0 overflow-y-auto bg-card-2/30">
            {recentFailures.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-text-muted gap-2">
                <p className="text-[10px] text-text-dim">No recent delivery failures</p>
              </div>
            ) : (
              recentFailures.map((log) => (
                <FailureRow
                  key={log.id}
                  id={log.id}
                  wallet={log.walletHash ? `${log.walletHash.slice(0, 4)}…${log.walletHash.slice(-4)}` : "unknown"}
                  category={log.category ?? "system"}
                  reason={log.status === "failed" ? "Delivery failed" : log.status}
                  ts={new Date(log.queuedAt).toLocaleTimeString()}
                  status={log.status}
                />
              ))
            )}
          </div>

          <div className="shrink-0 border-t border-border/30 px-5 py-3 bg-card-2/50">
            <p className="text-[11px] text-text-dim flex justify-between">
              <span>Showing last {recentFailures.length} failures</span>
              <Link href="/notifications" className="text-teal hover:underline font-bold transition-colors">View all &rarr;</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}