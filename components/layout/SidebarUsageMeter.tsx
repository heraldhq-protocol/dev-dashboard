"use client";

import { cn } from "@/lib/utils";

export function SidebarUsageMeter({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "border-t border-border mt-auto shrink-0 p-4",
        "transition-opacity duration-200",
        collapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100",
      )}
    >
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span className="text-text-secondary">Usage</span>
        <span className="text-text-muted">78%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-card">
        <div className="h-full w-[78%] rounded-full bg-teal shadow-[0_0_8px_rgba(0,200,150,0.4)]" />
      </div>
      <div className="mt-2 text-[10px] text-text-muted font-mono">
        3,900 / 5,000 sends
      </div>
    </div>
  );
}
