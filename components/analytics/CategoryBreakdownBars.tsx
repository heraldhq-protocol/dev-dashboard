"use client";

const categories = [
  { name: "DeFi Alerts", value: 45, count: "8,753", color: "bg-red-400", dot: "bg-red-400" },
  { name: "Governance", value: 30, count: "5,835", color: "bg-purple-400", dot: "bg-purple-400" },
  { name: "Marketing", value: 15, count: "2,918", color: "bg-slate-400", dot: "bg-slate-400" },
  { name: "System Events", value: 10, count: "1,944", color: "bg-amber-400", dot: "bg-amber-400" },
];

export function CategoryBreakdownBars() {
  return (
    <div className="mt-3 flex flex-col gap-4">
      {categories.map((cat) => (
        <div key={cat.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full shrink-0 ${cat.dot}`} />
              <span className="font-semibold text-text-secondary">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-muted text-[11px]">{cat.count}</span>
              <span className="font-bold text-foreground w-8 text-right">{cat.value}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-2">
            <div
              className={`h-full rounded-full ${cat.color} transition-all duration-500`}
              style={{ width: `${cat.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
