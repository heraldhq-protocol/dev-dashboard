import * as React from "react";

import { cn } from "@/lib/utils";

type CardVariant = "default" | "glass" | "glow" | "flat";

const cardVariantStyles: Record<CardVariant, string> = {
  default: "rounded-xl border border-border bg-card text-text-primary shadow-sm",
  glass:
    "rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-text-primary shadow-sm dark:bg-white/5 dark:border-white/10",
  glow:
    "rounded-xl border border-border bg-card text-text-primary shadow-sm transition-all duration-300 hover:border-teal/20 hover:shadow-[var(--card-glow-hover)]",
  flat: "rounded-xl border-0 bg-card-2 text-text-primary",
};

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm"; variant?: CardVariant }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(cardVariantStyles[variant], className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className,
      )}
      {...props}
    />
  );
}


//TODO: PUSH CHANGES, I UPDATED THE COMPONENTS
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-extrabold leading-none tracking-tight text-xl text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-text-muted", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center p-6 pt-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
