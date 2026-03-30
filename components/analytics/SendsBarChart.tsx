"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { day: "Mon", sends: 4000 },
  { day: "Tue", sends: 3000 },
  { day: "Wed", sends: 2000 },
  { day: "Thu", sends: 2780 },
  { day: "Fri", sends: 1890 },
  { day: "Sat", sends: 2390 },
  { day: "Sun", sends: 3490 },
];

export function SendsBarChart() {
  return (
    <div className="h-[250px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === data.length - 1 ? "#00E5A8" : "#00C896"} opacity={index === data.length - 1 ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
     
