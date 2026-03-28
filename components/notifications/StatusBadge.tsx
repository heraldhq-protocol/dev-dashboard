import { cn } from "@/lib/utils";

type Status = "delivered" | "failed" | "queued" | "processing";

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    delivered: "bg-green/15 text-green border-green/20",
    failed: "bg-red/15 text-red border-red/20",
    queued: "bg-text-muted/15 text-text-muted border-transparent",
    processing: "bg-gold/15 text-gold border-gold/20",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
