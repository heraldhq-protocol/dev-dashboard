"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SendsBarChart } from "@/components/analytics/SendsBarChart";
import { DeliveryStatusDonut } from "@/components/analytics/DeliveryStatusDonut";
import { CategoryBreakdownBars } from "@/components/analytics/CategoryBreakdownBars";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsTrends } from "@/lib/api/analytics";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  const { data, isLoading } = useQuery({
    queryKey: ["analyticsTrends", days],
    queryFn: () => getAnalyticsTrends(days),
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
            <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5" onClick={() => alert("Mock export CSV initiated")}>
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
        <StatCard
          label="Total Delivered"
          value={isLoading ? "..." : delivered.toLocaleString()}
          delta="—"
          deltaType="neutral"
          detail={`last ${days} days`}
          isLoading={isLoading}
        />
        <StatCard
          label="Failed"
          value={isLoading ? "..." : failed.toLocaleString()}
          delta="—"
          deltaType="neutral"
          detail={`last ${days} days`}
          isLoading={isLoading}
        />
        <StatCard
          label="Avg. Latency"
          value="142ms"
          delta="↓ 8ms"
          deltaType="positive"
          detail="p95 response time"
          isLoading={isLoading}
        />
        <StatCard
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
        <Card variant="glow" className="overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider text-left">
                  Message Volume
                </CardTitle>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {isLoading ? "..." : totalVolume.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="flex items-center rounded-lg bg-card-2 p-0.5 border border-border">
                  <button
                    onClick={() => setChartType("bar")}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      chartType === "bar"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-text-muted hover:text-foreground"
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType("area")}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      chartType === "area"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-text-muted hover:text-foreground"
                    }`}
                  >
                    Area
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <span>This period</span>
                  <span className="text-text-secondary font-mono">{dateRangeStr}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {!isLoading && data ? (
              <SendsBarChart data={data.dailyVolume || []} type={chartType} />
            ) : (
              <div className="h-[250px] w-full flex items-center justify-center">
                <div className="animate-shimmer h-full w-full rounded-md opacity-20" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Donut + Category */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {/* Delivery Status */}
          <Card variant="glow" className="overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-left">
                  Delivery Status
                </CardTitle>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 border border-teal/20 px-2 py-0.5 text-[9px] font-bold text-teal uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                  Live
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              {!isLoading && data ? (
                <DeliveryStatusDonut data={data.statusBreakdown || []} />
              ) : (
                <div className="h-[180px] w-full flex items-center justify-center">
                  <div className="animate-shimmer h-32 w-32 rounded-full opacity-20" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Split */}
          <Card variant="glow" className="overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-left">
                  Category Split
                </CardTitle>
                <span className="text-[10px] text-text-muted font-mono">
                  by volume
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {!isLoading && data ? (
                <CategoryBreakdownBars data={data.categoryBreakdown || []} />
              ) : (
                <div className="h-[180px] w-full flex flex-col gap-4 mt-2">
                  <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                  <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                  <div className="animate-shimmer h-8 w-full rounded-md opacity-20" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
