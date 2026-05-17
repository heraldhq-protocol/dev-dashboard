"use client";

import { StatCard } from "@/components/shared/StatCard";
import type { EngagementMetrics } from "@/lib/api/analytics";

interface Props {
  data: EngagementMetrics | undefined;
  isLoading: boolean;
}

export function EngagementKpiRow({ data, isLoading }: Props) {
  const fmt = (n: number) => n.toLocaleString();
  const pct = (n: number) => `${n.toFixed(1)}%`;

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
        label="Click Rate"
        value={isLoading ? "—" : pct(data?.clickRate ?? 0)}
        detail={isLoading ? "" : `${fmt(data?.clicks ?? 0)} clicks`}
        deltaType={(data?.clickRate ?? 0) >= 5 ? "positive" : "neutral"}
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
