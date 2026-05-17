"use client";

import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/api";

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md";
  className?: string;
}

const CONFIG: Record<VerificationStatus, { label: string; classes: string; icon: string }> = {
  VERIFIED: {
    label: "Verified",
    classes: "bg-teal/10 text-teal border-teal/20",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  PENDING: {
    label: "Verification Pending",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  REJECTED: {
    label: "Verification Rejected",
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  UNVERIFIED: {
    label: "Unverified",
    classes: "bg-card-2 text-text-muted border-border",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export function VerificationBadge({ status, size = "sm", className }: VerificationBadgeProps) {
  const { label, classes, icon } = CONFIG[status] ?? CONFIG.UNVERIFIED;
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  return (
    <span className={cn(`inline-flex items-center gap-1 rounded-full border font-medium ${padding} ${textSize} ${classes}`, className)}>
      <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {label}
    </span>
  );
}
