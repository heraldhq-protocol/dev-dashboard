"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

interface Props {
  data: { date: string; count: number }[];
}

export function RegistrationTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    day: format(parseISO(d.date), "MMM d"),
    registrations: d.count,
  }));

  if (!chartData.length) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs text-text-muted">
        No registration data
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="audienceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c896" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-alt)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-8}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-card-2)",
              border: "1px solid var(--border-alt)",
              borderRadius: "8px",
              color: "var(--text-main)",
            }}
            itemStyle={{ color: "#00C896", fontWeight: "bold" }}
            formatter={(value) => [Number(value).toLocaleString(), "Registrations"]}
          />
          <Area
            type="monotone"
            dataKey="registrations"
            stroke="#00C896"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#audienceGrad)"
            activeDot={{ r: 5, fill: "#00E5A8", stroke: "var(--bg-card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
