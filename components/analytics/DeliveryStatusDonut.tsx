"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Delivered", value: 85, color: "#00C896" },
  { name: "Failed", value: 10, color: "#D63031" },
  { name: "Processing", value: 5, color: "#E8920A" },
];

export function DeliveryStatusDonut() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-[180px] w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
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
          <span className="text-2xl font-bold text-white">85%</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            Success
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 mt-2 pb-1 self-start">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] text-text-muted font-medium">
              {entry.name}
            </span>
            <span className="text-[11px] text-white font-bold">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
