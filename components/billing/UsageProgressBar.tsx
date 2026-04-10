"use client";

import { cn } from "@/lib/utils";

interface UsageProgressBarProps {
  used: number;
  quota: number;
  label?: string;
  showDetails?: boolean;
}

/**
 * UsageProgressBar
 * 
 * A premium progress bar for displaying usage metrics (quota, limits, spend).
 * Features theme-syncing colors, smooth transitions, and state-aware aesthetics.
 */
export function UsageProgressBar({ 
  used, 
  quota, 
  label = "Current Usage",
  showDetails = true 
}: UsageProgressBarProps) {
  const percentage = Math.min(Math.round((used / quota) * 100), 100);

  // Status thresholds
  const isWarning = percentage >= 80 && percentage < 100;
  const isCritical = percentage >= 100;

  // Aesthetic configuration
  const barColor = isCritical
    ? "bg-red shadow-[0_0_12px_rgba(214,48,49,0.4)]"
    : isWarning
      ? "bg-gold shadow-[0_0_12px_rgba(232,146,10,0.3)]"
      : "bg-teal shadow-[0_0_12px_rgba(0,200,150,0.3)]";

  return (
    <div className="w-full space-y-3 group">
      {/* Labels */}
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-text-secondary transition-colors">
          {label}
        </span>
        {showDetails && (
          <span
            className={cn(
              "text-sm font-mono transition-colors",
              isCritical ? "text-red font-bold" : isWarning ? "text-gold font-bold" : "text-foreground"
            )}
          >
            {used.toLocaleString()} <span className="text-[10px] text-text-muted font-sans uppercase">/</span> {quota.toLocaleString()}
            <span className={cn(
              "ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold",
              isCritical ? "bg-red/20 text-red" : isWarning ? "bg-gold/20 text-gold" : "bg-teal/20 text-teal"
            )}>
              {percentage}%
            </span>
          </span>
        )}
      </div>

      {/* Bar Container */}
      <div className="h-3 w-full bg-navy border border-border-2 rounded-full overflow-hidden p-[2px] shadow-inner">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full relative",
            barColor,
            isCritical ? "animate-pulse" : ""
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Warning Messages */}
      {(isWarning || isCritical) && (
        <div
          className={cn(
            "flex items-start gap-2 p-2.5 rounded-lg border leading-tight animate-in fade-in slide-in-from-top-1 duration-300",
            isCritical 
              ? "bg-red/5 border-red/20 text-red" 
              : "bg-gold/5 border-gold/20 text-gold"
          )}
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[11px] font-medium">
            {isCritical
              ? "Critical Limit Reached: Your current plan capacity is exhausted. Notifications may be delayed or dropped until renewal or upgrade."
              : "Warning: You are approaching your monthly capacity limit. Upgrading your plan now will ensure uninterrupted delivery."}
          </p>
        </div>
      )}
    </div>
  );
}
