"use client";

import { StatCard } from "@/components/shared/StatCard";
import type { EngagementMetrics } from "@/lib/api/analytics";

interface Props {
  data: EngagementMetrics | undefined;
  isLoading: boolean;
  tgClicks?: number;
}

export function EngagementKpiRow({ data, isLoading, tgClicks = 0 }: Props) {
  const fmt = (n: number) => n.toLocaleString();
  const pct = (n: number) => `${n.toFixed(1)}%`;

  const totalClicks = (data?.clicks ?? 0) + tgClicks;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Sends"
        value={isLoading ? "—" : fmt(data?.totalSends ?? 0)}
        detail="tracked notifications"
        isLoading={isLoading}
      />
      <StatCard
        label="Open Rate"
        value={isLoading ? "—" : pct(data?.openRate ?? 0)}
        detail={isLoading ? "" : `${fmt(data?.opens ?? 0)} opens`}
        deltaType={(data?.openRate ?? 0) >= 20 ? "positive" : "neutral"}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Clicks"
        value={isLoading ? "—" : fmt(totalClicks)}
        detail={tgClicks > 0 ? `email + telegram` : `${fmt(data?.clicks ?? 0)} email`}
        deltaType={totalClicks > 0 ? "positive" : "neutral"}
        isLoading={isLoading}
      />
      <StatCard
        label="Unsubscribe Rate"
        value={isLoading ? "—" : pct(data?.unsubscribeRate ?? 0)}
        detail={isLoading ? "" : `${fmt(data?.unsubscribes ?? 0)} unsubscribes`}
        deltaType={(data?.unsubscribeRate ?? 0) > 2 ? "negative" : "positive"}
        isLoading={isLoading}
      />
    </div>
  );
}
