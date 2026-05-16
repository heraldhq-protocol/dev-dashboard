"use client";

import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "degraded" | "failing";

const STATUS_CONFIG: Record<
  HealthStatus,
  { dot: string; text: string; label: string }
> = {
  healthy: {
    dot: "bg-green shadow-[0_0_6px_rgba(16,185,129,0.6)]",
    text: "text-green",
    label: "Healthy",
  },
  degraded: {
    dot: "bg-gold shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    text: "text-gold",
    label: "Degraded",
  },
  failing: {
    dot: "bg-red shadow-[0_0_6px_rgba(239,68,68,0.6)]",
    text: "text-red",
    label: "Failing",
  },
};

interface WebhookReliabilityBadgeProps {
  healthStatus: HealthStatus;
  successRate: number;
  p99LatencyMs: number | null;
  /** When true, renders a compact inline version (dot + rate only) */
  compact?: boolean;
}

export function WebhookReliabilityBadge({
  healthStatus,
  successRate,
  p99LatencyMs,
  compact = false,
}: WebhookReliabilityBadgeProps) {
  const cfg = STATUS_CONFIG[healthStatus];

  if (compact) {
    return (
      <span className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
        <span className={cn("text-xs font-semibold", cfg.text)}>
          {successRate.toFixed(1)}%
        </span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
        <span className={cn("font-semibold", cfg.text)}>{cfg.label}</span>
      </span>
      <span className="text-text-muted">{successRate.toFixed(1)}% success</span>
      {p99LatencyMs !== null && (
        <span className="text-text-muted">P99: {p99LatencyMs}ms</span>
      )}
      <span className="text-text-muted italic text-[10px]">7d</span>
    </div>
  );
}
