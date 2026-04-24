"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type DeltaType = "positive" | "negative" | "neutral";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

/**
 * Inline SVG mini-sparkline. Zero dependencies — renders a smooth polyline
 * from an array of numbers (the chart only shows shape, not axis labels).
 */
function Sparkline({ data, color = "#00c896", height = 36 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const width = 80;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = points.join(" ");

  // Build fill path: go to bottom-right, bottom-left, close
  const lastX = ((data.length - 1) / (data.length - 1)) * width;
  const fillPath = `M${points[0]} L${polyline
    .split(" ")
    .slice(1)
    .join(" L")} L${lastX.toFixed(1)},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`sparkFill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path
        d={fillPath}
        fill={`url(#sparkFill-${color.replace("#", "")})`}
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle
        cx={lastX}
        cy={points[points.length - 1].split(",")[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

const Arrow = ({ type }: { type: DeltaType }) => {
  if (type === "positive")
    return (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  if (type === "negative")
    return (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  return null;
};

function DeltaBadge({ delta, type }: { delta: string; type: DeltaType }) {
  if (!delta) return null;

  const styles: Record<DeltaType, string> = {
    positive: "text-teal bg-teal/10",
    negative: "text-red bg-red/10",
    neutral: "text-text-muted bg-card-2",
  };

  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0", styles[type])}>
      <Arrow type={type} />
      {delta}
    </span>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: DeltaType;
  detail?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  glowOnHover?: boolean;
  className?: string;
}

/**
 * StatCard
 *
 * Premium KPI metric card with optional sparkline, delta badge, and glow effect.
 * Replaces hand-rolled Card markup in overview + analytics pages.
 */
export function StatCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  detail,
  sparklineData,
  sparklineColor = "#00c896",
  icon,
  isLoading,
  glowOnHover = true,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className={cn("relative rounded-xl border border-border bg-navy-2 p-5 overflow-hidden", className)}>
        <div className="animate-shimmer h-3 w-24 rounded mb-4" />
        <div className="animate-shimmer h-7 w-16 rounded mb-2" />
        <div className="animate-shimmer h-2.5 w-32 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-navy-2 p-5 overflow-hidden cursor-default",
        "transition-all duration-300",
        glowOnHover && "hover:border-teal/20 hover:shadow-(--card-glow-hover)",
        className,
      )}
    >
      {/* Corner glow on hover */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-20 w-20 rounded-full bg-teal/8 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="text-text-muted shrink-0">{icon}</span>
          )}
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider truncate">
            {label}
          </p>
        </div>
        {delta && <DeltaBadge delta={delta} type={deltaType} />}
      </div>

      {/* Value + sparkline row */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground tracking-tight leading-none">
            {value}
          </p>
          {detail && (
            <p className="text-[11px] text-text-muted mt-1.5">{detail}</p>
          )}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <Sparkline data={sparklineData} color={sparklineColor} />
          </div>
        )}
      </div>
    </div>
  );
}
