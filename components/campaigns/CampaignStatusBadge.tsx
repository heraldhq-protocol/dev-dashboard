import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/api/campaigns";

const STATUS_STYLES: Record<Campaign["status"], string> = {
  DRAFT: "bg-border text-text-muted border-border",
  SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RUNNING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-teal/10 text-teal border-teal/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-border text-text-muted border-border",
};

const STATUS_LABELS: Record<Campaign["status"], string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  RUNNING: "Running",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export function CampaignStatusBadge({ status }: { status: Campaign["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        STATUS_STYLES[status]
      )}
    >
      {status === "RUNNING" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
        </span>
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
