export function DateRangePicker() {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-card-2 p-1 border border-border">
      {["7d", "30d", "90d", "YTD"].map((range) => (
        <button
          key={range}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
            range === "30d" 
              ? "bg-navy-2 text-foreground shadow-sm ring-1 ring-border" 
              : "text-text-muted hover:text-text-secondary hover:bg-navy-2/50"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
