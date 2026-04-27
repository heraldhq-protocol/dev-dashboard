import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  header?: {
    title: string;
    action?: React.ReactNode;
  };
  footer?: {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
}

export function DashboardCard({
  children,
  className,
  header,
  footer,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6",
        "transition-all duration-200 ease-out",
        "hover:border-border-2 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5",
        className
      )}
    >
      {header && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {header.title}
          </h3>
          {header.action && <div>{header.action}</div>}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-14 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div>{footer.left}</div>
          <div>{footer.right}</div>
        </div>
      )}
    </div>
  );
}