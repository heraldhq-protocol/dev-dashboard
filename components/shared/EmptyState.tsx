import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState
 *
 * Shown when a list/table has no items.
 * Follows the "show — don't tell" principle with a visual icon, label, and a CTA.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        "rounded-xl border border-border border-dashed bg-card-2/30",
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border mb-5 text-text-muted shadow-sm">
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
