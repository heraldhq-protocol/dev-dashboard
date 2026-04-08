"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, parseISO } from "date-fns";

interface SendsBarChartProps {
  data: { date: string; volume: number }[];
}

export function SendsBarChart({ data }: SendsBarChartProps) {
  // Format dates for display
  const chartData = data.map(d => ({
    day: format(parseISO(d.date), "MMM d"),
    sends: d.volume
  }));

  if (!chartData.length) {
    return <div className="h-[250px] w-full flex items-center justify-center text-text-muted">No data available</div>;
  }

  return (
    <div className="h-[250px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
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
            cursor={{ fill: "#1A3A52", opacity: 0.4 }}
            contentStyle={{ backgroundColor: "#112240", border: "1px solid #1A3A52", borderRadius: "8px" }}
            itemStyle={{ color: "#00C896" }}
          />
          <Bar dataKey="sends" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#00E5A8" : "#00C896"} opacity={index === chartData.length - 1 ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
     
