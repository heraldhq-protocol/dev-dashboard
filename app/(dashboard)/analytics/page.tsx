"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SendsBarChart } from "@/components/analytics/SendsBarChart";
import { DeliveryStatusDonut } from "@/components/analytics/DeliveryStatusDonut";
import { CategoryBreakdownBars } from "@/components/analytics/CategoryBreakdownBars";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsTrends } from "@/lib/api/analytics";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);

  const { data, isLoading } = useQuery({
    queryKey: ["analyticsTrends", days],
    queryFn: () => getAnalyticsTrends(days),
  });

  const totalVolume = data?.totalVolume || 0;
  const delivered = data?.statusBreakdown.find(s => s.status.toLowerCase() === "delivered")?._count?.id || 0;
  const failed = data?.statusBreakdown.find(s => s.status.toLowerCase() === "failed")?._count?.id || 0;

  const kpiCards = [
    {
      label: "Total Delivered",
      value: delivered.toLocaleString(),
      delta: "",
      deltaType: "positive" as const,
      detail: `last ${days} days`,
    },
    {
      label: "Failed",
      value: failed.toLocaleString(),
      delta: "",
      deltaType: "negative" as const,
      detail: `last ${days} days`,
    },
    {
      label: "Avg. Latency",
      value: "142ms", // Mocked as it's not in the trends DTO
      delta: "-8ms",
      deltaType: "positive" as const,
      detail: "p95 response time",
    },
    {
      label: "Message Volume",
      value: totalVolume.toLocaleString(),
      delta: "",
      deltaType: "positive" as const,
      detail: `last ${days} days`,
    },
  ];

  const dateRangeStr = `${format(subDays(new Date(), days), "MMM d")} – ${format(new Date(), "MMM d")}`;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Deep dive into your protocol&apos;s notification performance.
          </p>
        </div>
        <DateRangePicker days={days} setDays={setDays} />
      </div>

      {/* KPI Summary Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="group relative bg-navy-2 border border-border-2 rounded-xl p-4 sm:p-5 hover:border-teal/20 transition-all duration-300 overflow-hidden"
          >
            {/* Subtle corner glow on hover */}
            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-teal/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

            {/* Header row: label justify-between delta */}
            <div className="relative flex items-center justify-between gap-2 mb-3">
              <p className="text-[11px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider truncate">
                {kpi.label}
              </p>
              <span
                className={`inline-flex items-center gap-1 shrink-0 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                  kpi.deltaType === "positive"
                    ? "text-teal bg-teal/10"
                    : "text-red-400 bg-red-500/10"
                }`}
              >
                {kpi.deltaType === "positive" ? (
                  <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {kpi.delta}
              </span>
            </div>

            {/* Value section with divider */}
            <div className="relative border-t border-border/40 pt-3">
              <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {isLoading ? "..." : kpi.value}
              </p>
              <p className="text-[10px] sm:text-[11px] text-text-muted mt-0.5">{kpi.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Message Volume Chart */}
        <Card className="bg-navy-2 border-border-2 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
              <div className="flex sm:flex-col items-center sm:items-end gap-1 text-[11px] text-text-muted">
                <span>This period</span>
                <span className="text-text-secondary font-mono">{dateRangeStr}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {!isLoading && data ? (
              <SendsBarChart data={data.dailyVolume || []} />
            ) : (
              <div className="h-[250px] w-full flex items-center justify-center text-text-muted">Loading chart...</div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Donut + Category */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {/* Delivery Status */}
          <Card className="bg-navy-2 border-border-2 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm! font-semibold text-text-muted uppercase tracking-wide text-left">
                  Delivery Status
                </CardTitle>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 border border-teal/20 px-2 py-0.5 text-[10px] font-bold text-teal uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                  Live
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              {!isLoading && data ? (
                <DeliveryStatusDonut data={data.statusBreakdown || []} />
              ) : (
                <div className="h-[180px] w-full flex items-center justify-center text-text-muted">Loading...</div>
              )}
            </CardContent>
          </Card>

          {/* Category Split */}
          <Card className="bg-navy-2 border-border-2 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wide text-left">
                  Category Split
                </CardTitle>
                <span className="text-[11px] text-text-muted font-mono">
                  by volume
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {!isLoading && data ? (
                <CategoryBreakdownBars data={data.categoryBreakdown || []} />
              ) : (
                <div className="mt-3 py-6 flex items-center justify-center text-sm text-text-muted">Loading...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
