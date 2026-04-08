"use client";

interface CategoryBreakdownBarsProps {
  data: { category: string; _count: { id: number } }[];
}

const categoryColors: Record<string, { bg: string; dot: string }> = {
  defi: { bg: "bg-red-400", dot: "bg-red-400" },
  governance: { bg: "bg-purple-400", dot: "bg-purple-400" },
  marketing: { bg: "bg-slate-400", dot: "bg-slate-400" },
  system: { bg: "bg-amber-400", dot: "bg-amber-400" },
};

export function CategoryBreakdownBars({ data }: CategoryBreakdownBarsProps) {
  const total = data.reduce((sum, item) => sum + item._count.id, 0);

  if (total === 0) {
    return <div className="mt-3 py-6 flex items-center justify-center text-sm text-text-muted">No data available</div>;
  }

  const chartData = data
    .map(d => ({
      name: d.category.charAt(0).toUpperCase() + d.category.slice(1),
      value: Math.round((d._count.id / total) * 100),
      count: d._count.id.toLocaleString(),
      color: categoryColors[d.category]?.bg || "bg-teal",
      dot: categoryColors[d.category]?.dot || "bg-teal"
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="mt-3 flex flex-col gap-4">
      {chartData.map((cat) => (
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
