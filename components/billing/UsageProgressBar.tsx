import { cn } from "@/lib/utils";

interface UsageProgressBarProps {
  used: number;
  quota: number;
}

export function UsageProgressBar({ used, quota }: UsageProgressBarProps) {
  const percentage = Math.min(Math.round((used / quota) * 100), 100);
  
  // Color tiering
  // < 80%: teal
  // >= 80%: gold/amber (with warning icon)
  // >= 100%: red
  const isWarning = percentage >= 80 && percentage < 100;
  const isCritical = percentage >= 100;

  const barColor = isCritical 
    ? "bg-red" 
    : isWarning 
      ? "bg-gold" 
      : "bg-teal shadow-[0_0_10px_rgba(0,200,150,0.5)]";

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-text-secondary">Current Usage</span>
        <span className={isCritical ? "text-red" : isWarning ? "text-gold" : "text-white"}>
          {used.toLocaleString()} / {quota.toLocaleString()}
          <span className="text-text-muted ml-1 font-normal">({percentage}%)</span>
        </span>
      </div>
      
      <div className="h-2 w-full bg-navy-3 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 rounded-full", barColor, isCritical ? "animate-pulse" : "")} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {(isWarning || isCritical) && (
        <p className={cn("text-xs font-medium flex items-center gap-1.5 mt-2", isCritical ? "text-red" : "text-gold")}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {isCritical ? "You have exceeded your monthly quota. Notifications may be dropped." : "Approaching monthly limit. Consider upgrading your plan."}
        </p>
      )}
    </div>
  );
}
