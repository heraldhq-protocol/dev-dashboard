"use client";

export function SidebarUsageMeter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <div className="p-4 border-t border-border mt-auto">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span className="text-text-secondary">Usage</span>
        <span className="text-text-muted">78%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-card">
        <div className="h-full w-[78%] rounded-full bg-teal" />
      </div>
      <div className="mt-2 text-[10px] text-text-muted font-mono">
        3,900 / 5,000 sends
      </div>
    </div>
  );
}
