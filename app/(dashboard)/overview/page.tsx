"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiAlertTriangle } from "react-icons/fi";
import { FaCopy } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/analytics";

const performanceData = [
  { date: "Mar 1", sends: 120 },
  { date: "Mar 2", sends: 340 },
  { date: "Mar 3", sends: 210 },
  { date: "Mar 4", sends: 890 },
  { date: "Mar 5", sends: 1100 },
  { date: "Mar 6", sends: 950 },
  { date: "Mar 7", sends: 1450 },
];

const mockFailedLogs = [
  {
    id: "notif_8x2f",
    wallet: "7aV...9xK",
    category: "defi",
    reason: "RPC Timeout",
    ts: "2m ago",
  },
  {
    id: "notif_9m1p",
    wallet: "G2z...4rW",
    category: "governance",
    reason: "Invalid Signature",
    ts: "14m ago",
  },
  {
    id: "notif_2k9l",
    wallet: "4xP...1tB",
    category: "system",
    reason: "Rate Limited",
    ts: "31m ago",
  },
];

const categoryColors: Record<string, string> = {
  defi: "text-red-400 bg-red-400/10 border-red-400/20",
  governance: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  system: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  marketing: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function FailureRow({
  id,
  wallet,
  category,
  reason,
  ts,
}: (typeof mockFailedLogs)[0]) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex items-start gap-3 px-5 py-4 hover:bg-white/3 transition-colors rounded-lg cursor-pointer">
      {/* Icon */}
      <div className="mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
        <FiAlertTriangle className="h-3.5 w-3.5 text-red-400" />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reason — primary info */}
          <span className="text-sm font-semibold text-foreground">{reason}</span>
          {/* Category badge */}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              categoryColors[category] ?? categoryColors.marketing
            }`}
          >
            {category}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="text-sm text-text-muted">
          Monitor your Herald notification infrastructure.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted text-left">
              Total Sends (This Period)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-card-2 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-bold text-white">
                {stats?.sendsThisPeriod.toLocaleString() ?? 0}
              </div>
            )}
            <p className="text-xs text-teal mt-1">Based on current cycle</p>
          </CardContent>
        </Card>

        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted text-left">
              Delivery Rate (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-card-2 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-bold text-white">
                {stats?.deliverySuccessRate?.toFixed(1) ?? "100.0"}%
              </div>
            )}
            <p className="text-xs text-text-muted mt-1">
              Based on on-chain confirmations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted text-left">
              Active Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-card-2 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-bold text-white">
                {stats?.activeWebhooks ?? 0}
              </div>
            )}
            <p className="text-xs text-text-muted mt-1">
              Currently listening to events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Failures */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart */}
        <Card className="lg:col-span-4 bg-navy-2 border-border-2 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base text-left">
              Notification Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full min-w-0 pb-4 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1A3A52"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#112240",
                      border: "1px solid #1A3A52",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#00C896" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sends"
                    stroke="#00C896"
                    strokeWidth={3}
                    dot={{ fill: "#00C896", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#00E5A8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Failures — redesigned */}
        <Card className="lg:col-span-3 bg-navy-2 border-border-2 rounded-xl flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Recent Failures</CardTitle>
              {/* Live count badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                {mockFailedLogs.length}
              </span>
            </div>
            <button className="text-xs text-text-muted hover:text-teal transition-colors">
              View all →
            </button>
          </CardHeader>

          <div className="flex-1 flex flex-col divide-y divide-border/30 py-1 overflow-y-auto">
            {mockFailedLogs.map((log) => (
              <FailureRow key={log.id} {...log} />
            ))}
          </div>

          {/* Footer hint */}
          <div className="shrink-0 border-t border-border/30 px-5 py-3">
            <p className="text-[11px] text-text-dim">
              Showing last 3 failures · Retries attempted automatically
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}