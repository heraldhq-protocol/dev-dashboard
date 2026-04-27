import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface MetricCardProps {
  label: string;
  value: string | React.ReactNode;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  detail?: string;
  sparklineData?: number[];
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  detail,
  sparklineData,
  isLoading,
}: MetricCardProps) {
  const chartData = sparklineData?.map((v, i) => ({ value: v, index: i })) ?? [];

  const trendColors = {
    positive: "bg-status-success/10 text-status-success",
    negative: "bg-red/10 text-red",
    neutral: "bg-muted text-text-muted",
  };

  const trendDotColors = {
    positive: "#00c896",
    negative: "#ef4444",
    neutral: "#64748b",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 ease-out hover:border-border-2 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </h3>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trendColors[deltaType]
            )}
          >
            {delta}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-10 bg-card-2 animate-pulse rounded w-24" />
      ) : (
        <div className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: '"Syne", system-ui, sans-serif' }}>
          {value}
        </div>
      )}

      {detail && (
        <p className="text-xs text-text-muted mt-1">{detail}</p>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`sparkline-${label.replace(/\s+/g, "-").toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trendDotColors[deltaType]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={trendDotColors[deltaType]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={trendDotColors[deltaType]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#sparkline-${label.replace(/\s+/g, "-").toLowerCase()})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {sparklineData && sparklineData.length === 0 && (
        <div className="mt-4 h-10 flex items-center">
          <div className="w-full border-b border-dashed border-border-2 opacity-50" />
        </div>
      )}
    </div>
  );
}