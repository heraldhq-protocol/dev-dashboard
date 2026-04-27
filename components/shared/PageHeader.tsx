import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader
 *
 * Standardised heading block used at the top of every dashboard page.
 * Supports an optional right-aligned `actions` slot for CTAs / filters.
 * Title uses Syne font, description uses Inter.
 */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: '"Syne", system-ui, sans-serif' }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
