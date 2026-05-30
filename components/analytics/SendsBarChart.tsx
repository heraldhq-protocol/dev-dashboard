"use client";

import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";

const CHANNEL_COLORS = {
  email:    { stroke: "#00C896", fill: "#00C896" },
  telegram: { stroke: "#3B82F6", fill: "#3B82F6" },
  sms:      { stroke: "#F59E0B", fill: "#F59E0B" },
};

interface SingleData  { date: string; volume: number }
interface ChannelData { date: string; email: number; telegram: number; sms: number }

interface SendsBarChartProps {
  data: SingleData[];
  channelData?: ChannelData[];
  type?: "bar" | "area";
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--bg-card-2)",
    border: "1px solid var(--border-alt)",
    borderRadius: "8px",
    color: "var(--text-main)",
  },
};

export function SendsBarChart({ data, channelData, type = "bar" }: SendsBarChartProps) {
  const useMulti = !!(channelData && channelData.length > 0);

  if (useMulti) {
    const chartData = channelData!.map(d => ({
      day:      format(parseISO(d.date), "MMM d"),
      Email:    d.email,
      Telegram: d.telegram,
      SMS:      d.sms,
    }));

    if (!chartData.length) {
      return <div className="h-[250px] w-full flex items-center justify-center text-text-muted">No data available</div>;
    }

    if (type === "area") {
      return (
        <div className="h-[270px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {(["Email", "Telegram", "SMS"] as const).map((ch) => {
                  const key = ch.toLowerCase() as keyof typeof CHANNEL_COLORS;
                  return (
                    <linearGradient key={ch} id={`grad-${ch}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHANNEL_COLORS[key].fill} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHANNEL_COLORS[key].fill} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-alt)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {(["Email", "Telegram", "SMS"] as const).map((ch) => {
                const key = ch.toLowerCase() as keyof typeof CHANNEL_COLORS;
                return (
                  <Area
                    key={ch}
                    type="monotone"
                    dataKey={ch}
                    stroke={CHANNEL_COLORS[key].stroke}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad-${ch})`}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-[270px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-alt)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
            <Tooltip cursor={{ fill: "var(--bg-card-2)", opacity: 0.8 }} {...tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {(["Email", "Telegram", "SMS"] as const).map((ch) => {
              const key = ch.toLowerCase() as keyof typeof CHANNEL_COLORS;
              return (
                <Bar
                  key={ch}
                  dataKey={ch}
                  stackId="channels"
                  fill={CHANNEL_COLORS[key].fill}
                  radius={ch === "SMS" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Single-series fallback ────────────────────────────────────────────────
  const chartData = data.map(d => ({
    day:   format(parseISO(d.date), "MMM d"),
    sends: d.volume,
  }));

  if (!chartData.length) {
    return <div className="h-[250px] w-full flex items-center justify-center text-text-muted">No data available</div>;
  }

  if (type === "area") {
    return (
      <div className="h-[250px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSendsBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00c896" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-alt)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
            <Tooltip {...tooltipStyle} itemStyle={{ color: "#00C896", fontWeight: "bold" }} />
            <Area type="monotone" dataKey="sends" stroke="#00C896" strokeWidth={3} fillOpacity={1} fill="url(#colorSendsBar)" activeDot={{ r: 6, fill: "#00E5A8", stroke: "var(--bg-card)", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
          <Tooltip cursor={{ fill: "var(--bg-card-2)", opacity: 0.8 }} {...tooltipStyle} itemStyle={{ color: "#00C896", fontWeight: "bold" }} />
          <Bar dataKey="sends" fill="#00C896" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
