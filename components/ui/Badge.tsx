import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-teal text-navy",
        secondary: "border-transparent bg-card-2 text-text-secondary",
        outline: "text-text-muted border-border",
        success: "border-green/20 bg-green/15 text-green",
        destructive: "border-red/20 bg-red/15 text-red",
        warning: "border-gold/20 bg-gold/15 text-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
