"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Delivered", value: 85, color: "#00C896" },
  { name: "Failed", value: 10, color: "#D63031" },
  { name: "Processing", value: 5, color: "#E8920A" },
];

export function DeliveryStatusDonut() {
  return (
    <div className="h-[250px] w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#112240", border: "1px solid #1A3A52", borderRadius: "8px" }}
            itemStyle={{ color: "#FFFFFF" }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-white">85%</span>
        <span className="text-xs text-text-muted">Success Rate</span>
      </div>
    </div>
  );
}
