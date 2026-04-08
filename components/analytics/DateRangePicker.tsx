interface DateRangePickerProps {
  days: number;
  setDays: (days: number) => void;
}

export function DateRangePicker({ days, setDays }: DateRangePickerProps) {
  const options = [
    { label: "7d", value: 7 },
    { label: "30d", value: 30 },
    { label: "90d", value: 90 },
    { label: "YTD", value: 365 },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-card-2 p-1 border border-border">
      {options.map((range) => (
        <button
          key={range.label}
          onClick={() => setDays(range.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
            days === range.value 
              ? "bg-navy-2 text-foreground shadow-sm ring-1 ring-border" 
              : "text-text-muted hover:text-text-secondary hover:bg-navy-2/50"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
