import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
     className={cn(
          "flex h-11 w-full rounded-lg border border-border bg-navy px-3 py-2 text-sm ring-offset-navy file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:border-teal focus-visible:ring-1 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
      {...props}
    />
  )
}

export { Input }
