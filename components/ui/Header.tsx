"use client";

import { ChevronRight, ChevronDown, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  environment?: "sandbox" | "live";
  userInitials?: string;
  userKey?: string;
}

export function Header({
  environment = "sandbox",
  userInitials = "U",
  userKey = "user...",
}: HeaderProps) {
  const pathname = usePathname();
  const pageName = pathname.split("/").pop()?.replace(/-/g, " ") ?? "Overview";

  return (
    <header className="h-16 border-b border-border bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-8">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Dashboard</span>
          <ChevronRight className="w-4 h-4 text-muted/50" />
          <span className="text-foreground font-medium capitalize">
            {pageName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-secondary p-1 rounded-lg">
            <button
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                environment === "sandbox"
                  ? "bg-status-warning/10 text-status-warning border border-status-warning/20"
                  : "text-muted hover:text-foreground"
              )}
            >
              ● Sandbox
            </button>
            <button
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                environment === "live"
                  ? "bg-status-success/10 text-status-success border border-status-success/20"
                  : "text-muted hover:text-foreground"
              )}
            >
              Live
            </button>
          </div>

          <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted hover:text-foreground transition-colors">
            <Moon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {userInitials}
            </div>
            <span className="text-sm text-muted">{userKey}</span>
            <ChevronDown className="w-4 h-4 text-muted/50" />
          </div>
        </div>
      </div>
    </header>
  );
}