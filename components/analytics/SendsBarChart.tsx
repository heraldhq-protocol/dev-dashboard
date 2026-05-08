"use client";

import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

interface SendsBarChartProps {
  data: { date: string; volume: number }[];
  type?: "bar" | "area";
}

export function SendsBarChart({ data, type = "bar" }: SendsBarChartProps) {
  // Format dates for display
  const chartData = data.map(d => ({
    day: format(parseISO(d.date), "MMM d"),
    sends: d.volume
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
                <stop offset="5%" stopColor="#00c896" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-alt)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} dx={-8} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--bg-card-2)", border: "1px solid var(--border-alt)", borderRadius: "8px", color: "var(--text-main)" }}
              itemStyle={{ color: "#00C896", fontWeight: "bold" }}
            />
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
            tickFormatter={(value) => `${value}`} 
            dx={-8}
          />
          <Tooltip 
            cursor={{ fill: "var(--bg-card-2)", opacity: 0.8 }}
            contentStyle={{ backgroundColor: "var(--bg-card-2)", border: "1px solid var(--border-alt)", borderRadius: "8px", color: "var(--text-main)" }}
            itemStyle={{ color: "#00C896", fontWeight: "bold" }}
          />
          <Bar dataKey="sends" radius={[4, 4, 0, 0]} barSize={32}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#00E5A8" : "#00C896"} opacity={index === chartData.length - 1 ? 1 : 0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
