"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DeliveryStatusDonutProps {
  data: { status: string; _count: { id: number } }[];
}

const statusColors: Record<string, string> = {
  delivered: "#00C896",
  failed: "#D63031",
  processing: "#E8920A",
  queued: "#3498db"
};

export function DeliveryStatusDonut({ data }: DeliveryStatusDonutProps) {
  const chartData = data.map(d => ({
    name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
    value: d._count.id,
    color: statusColors[d.status] || "#64748B"
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const delivered = chartData.find(d => d.name.toLowerCase() === "delivered")?.value || 0;
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  if (total === 0) {
    return <div className="h-[180px] w-full flex items-center justify-center text-text-muted">No data available</div>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-[180px] w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#112240",
                border: "1px solid #1A3A52",
                borderRadius: "8px",
                fontSize: "10px",
              }}
              itemStyle={{ color: "#FFFFFF" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-foreground">{successRate}%</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            Success
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex w-full flex-col gap-3 mt-4 pb-1">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-text-muted font-medium">
                {entry.name}
              </span>
            </div>
            <span className="text-[11px] text-foreground font-bold">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
