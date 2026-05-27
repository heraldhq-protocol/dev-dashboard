"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  email: number;
  telegram: number;
  sms: number;
}

const COLORS = ["#00C896", "#6366f1", "#f59e0b"];
const CHANNEL_LABELS = ["Email", "Telegram", "SMS"];

export function ChannelCoverageDonut({ email, telegram, sms }: Props) {
  const raw = [email, telegram, sms];
  const total = raw.reduce((sum, v) => sum + v, 0);
  const data = CHANNEL_LABELS.map((name, i) => ({ name, value: raw[i] })).filter(
    (d) => d.value > 0
  );

  if (!data.length) {
    return (
      <div className="h-[180px] flex items-center justify-center text-xs text-text-muted">
        No channel data
      </div>
    );
  }

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={68}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-card-2)",
              border: "1px solid var(--border-alt)",
              borderRadius: "8px",
              color: "var(--text-main)",
              fontSize: "12px",
            }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : 0;
              return [`${total > 0 ? Math.round((n / total) * 100) : 0}%`, ""];
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "var(--text-muted)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
