"use client";

const categories = [
  { name: "DeFi Alerts", value: 45, color: "bg-purple" },
  { name: "Governance", value: 30, color: "bg-teal" },
  { name: "Marketing", value: 15, color: "bg-gold" },
  { name: "System Events", value: 10, color: "bg-red" },
];

export function CategoryBreakdownBars() {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {categories.map((cat) => (
        <div key={cat.name} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-text-secondary">{cat.name}</span>
            <span className="text-white">{cat.value}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy-2">
            <div 
              className={`h-full rounded-full ${cat.color}`} 
              style={{ width: `${cat.value}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
