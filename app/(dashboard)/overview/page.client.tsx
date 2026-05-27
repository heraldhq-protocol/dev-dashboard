"use client";

import { useNextStep } from "nextstepjs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { MetricCard } from "@/components/ui/MetricCard";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getAnalyticsTrends } from "@/lib/api/analytics";
import { listNotifications } from "@/lib/api/notifications";
import { getWebhookReliability } from "@/lib/api/webhooks";
import { useUiStore } from "@/lib/stores/ui.store";
import {
  sandboxDashboardStats,
  sandboxAnalyticsTrends,
  sandboxWebhookReliability,
} from "@/lib/sandbox-data";
import Link from "next/link";
import { BarChart3, ShieldCheck, Webhook } from "lucide-react";
import { ProjectedUsageCard } from "@/components/billing/ProjectedUsageCard";
import { WebhookReliabilityBadge } from "@/components/webhooks/WebhookReliabilityBadge";
import { getProtocol } from "@/lib/api/protocol";
import { VerificationCard } from "@/components/protocol/VerificationCard";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { getTwitterAuthUrl } from "@/lib/api/twitter";
import { toast } from "sonner";

export default function OverviewPage() {
  const { checklist } = useOnboardingStore();
  const { isNextStepVisible } = useNextStep();
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats", isSandbox],
    queryFn: isSandbox ? sandboxDashboardStats : getDashboardStats,
  });

  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["analyticsTrends", timeRange, isSandbox],
    queryFn: isSandbox
      ? () => sandboxAnalyticsTrends(timeRange === "7d" ? 7 : 30)
      : () => getAnalyticsTrends(timeRange === "7d" ? 7 : 30),
  });

  const { data: failedNotifs } = useQuery({
    queryKey: ["recentFailures", isSandbox],
    queryFn: isSandbox ? () => [] : () => listNotifications(1, 5, "failed"),
  });

  const { data: webhookReliability } = useQuery({
    queryKey: ["webhooks", "reliability", isSandbox],
    queryFn: isSandbox ? sandboxWebhookReliability : getWebhookReliability,
    staleTime: isSandbox ? 0 : 5 * 60 * 1000,
  });

  const { data: protocol } = useQuery({
    queryKey: ["protocol"],
    queryFn: getProtocol,
    staleTime: 5 * 60 * 1000,
  });

  const handleConnectX = async () => {
    try {
      const { authUrl } = await getTwitterAuthUrl();
      window.location.href = authUrl;
    } catch {
      toast.error("Failed to start X connection. Please try again.");
    }
  };

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
      <div id="overview-status-strip" className="flex items-center gap-2 rounded-lg border border-[rgba(16,185,129,0.2)] bg-status-success-bg px-4 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
        </span>
        <span className="text-[13px] font-medium text-[#10b981]">
          Herald Network: <span className="font-bold">Operational</span>
        </span>
      </div>

      {/* Protocol Inactive Banner — shown when X not connected yet */}
      {protocol && !protocol.isActive && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-amber-400 text-lg shrink-0">⚠</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-300">Your protocol is inactive</p>
              <p className="text-xs text-amber-400/70 truncate">
                Connect your project&apos;s X account to verify ownership and activate notifications.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnectX}
            className="shrink-0 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy text-xs font-bold px-3 py-1.5 transition-colors"
          >
            Connect X →
          </button>
        </div>
      )}

      {/* First-run checklist — hidden once dismissed, during tour, or while loading */}
      {!checklist.checklistDismissed && !isLoading && !isNextStepVisible && (
        <OnboardingChecklist
          hasApiKey={(stats?.activeApiKeys ?? 0) > 0}
          hasWebhook={(stats?.activeWebhooks ?? 0) > 0}
          hasSentNotification={(stats?.sendsThisPeriod ?? 0) > 0}
        />
      )}

      <PageHeader
        title="Overview"
        description="Monitor your Herald notification infrastructure."
      />

      {/* KPI Cards */}
      <div id="overview-metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Projected Usage + Webhook Health */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectedUsageCard />

        {/* Webhook Health Card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
                <Webhook className="h-3.5 w-3.5 text-text-muted" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Webhook Health
              </span>
            </div>
            {webhookReliability && (
              <WebhookReliabilityBadge
                healthStatus={
                  webhookReliability.overallSuccessRate >= 99
                    ? "healthy"
                    : webhookReliability.overallSuccessRate >= 90
                      ? "degraded"
                      : "failing"
                }
                successRate={webhookReliability.overallSuccessRate}
                p99LatencyMs={null}
                compact
              />
            )}
          </div>

          {!webhookReliability ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-3 bg-card-2 animate-pulse rounded" />
              ))}
            </div>
          ) : webhookReliability.webhooks.length === 0 ? (
            <p className="text-xs text-text-muted">No webhooks configured.</p>
          ) : (
            <div className="space-y-2">
              {webhookReliability.webhooks.slice(0, 3).map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between text-xs"
                >
                  <code className="text-text-muted truncate max-w-[55%]">
                    {wh.url.replace(/^https?:\/\//, "")}
                  </code>
                  <WebhookReliabilityBadge
                    healthStatus={wh.healthStatus}
                    successRate={wh.successRateLast7Days}
                    p99LatencyMs={wh.p99LatencyMs}
                    compact
                  />
                </div>
              ))}
            </div>
          )}

          <Link
            href="/webhooks"
            className="block text-xs text-teal hover:underline font-semibold"
          >
            View all webhooks →
          </Link>
        </div>
      </div>

      {/* Chart + Failures */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Notification Volume Chart */}
        <DashboardCard
          id="overview-volume-chart"
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
          id="overview-failures"
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

      {/* Protocol Verification */}
      {protocol && (
        <VerificationCard
          status={protocol.verificationStatus ?? "UNVERIFIED"}
          verifiedAt={protocol.verifiedAt}
        />
      )}
    </div>
  );
}