import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/api/campaigns";

interface CampaignProgressCardProps {
  campaign: Campaign;
}

export function CampaignProgressCard({ campaign }: CampaignProgressCardProps) {
  const { totalSent, totalFailed, totalTargets } = campaign;
  const progressPct =
    totalTargets > 0 ? Math.min(100, Math.round((totalSent / totalTargets) * 100)) : 0;
  const remaining = Math.max(0, totalTargets - totalSent - totalFailed);

  return (
    <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-amber-400 font-medium">Sending…</span>
        <span className="text-text-muted font-mono">{progressPct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-card-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            totalFailed > 0 ? "bg-amber-400" : "bg-teal"
          )}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[11px] pt-0.5">
        <span className="text-teal font-semibold">
          {totalSent.toLocaleString()} sent
        </span>
        {totalFailed > 0 && (
          <span className="text-red-400 font-semibold">
            {totalFailed.toLocaleString()} failed
          </span>
        )}
        <span className="text-text-muted">
          {remaining.toLocaleString()} remaining
        </span>
        <span className="ml-auto text-text-dim">
          / {totalTargets.toLocaleString()} total
        </span>
      </div>
    </div>
  );
}
