import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#00c896]/50 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-teal/10 text-teal border border-teal/20",
        success: "bg-status-success/10 text-status-success border border-status-success/20 rounded-full",
        warning: "bg-status-warning/10 text-status-warning border border-status-warning/20 rounded-full",
        error: "bg-status-error/10 text-status-error border border-status-error/20 rounded-full",
        secondary: "bg-secondary text-text-muted border border-border",
      },
      size: {
        default: "text-xs px-2 py-0.5",
        sm: "text-[10px] px-1.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };