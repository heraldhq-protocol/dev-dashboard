"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";

import {
  listScheduledNotifications,
  cancelScheduledNotification,
  type ScheduledNotification,
} from "@/lib/api/campaigns";
import { UpgradeGate } from "@/components/billing/UpgradeGate";

// ─── Helpers ─────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  const suffix = diff >= 0 ? "from now" : "ago";

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ${suffix}`;
  if (hours < 24) return `${hours}h ${suffix}`;
  return `${days}d ${suffix}`;
}

function truncateWallet(wallet: string): string {
  if (wallet.length <= 12) return wallet;
  return wallet.slice(0, 6) + "…" + wallet.slice(-4);
}

const STATUS_STYLES: Record<ScheduledNotification["status"], string> = {
  PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RUNNING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-teal/10 text-teal border-teal/20",
  CANCELLED: "bg-border text-text-muted border-border",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── Main Page ────────────────────────────────────────────────

export default function ScheduledNotificationsPage() {
  return (
    <UpgradeGate minTier={1} feature="Scheduled Notifications" description="Schedule one-time and recurring notifications for your users.">
      <ScheduledNotificationsContent />
    </UpgradeGate>
  );
}

function ScheduledNotificationsContent() {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["scheduledNotifications", page],
    queryFn: () => listScheduledNotifications(page),
    refetchInterval: 30_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelScheduledNotification(id);
      toast.success("Scheduled notification cancelled.");
      await queryClient.invalidateQueries({ queryKey: ["scheduledNotifications"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to cancel notification.");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <RippleWaveLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Notifications"
        description="One-time and recurring notifications scheduled for future delivery."
      />

      {items.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-teal/10 border border-teal/20">
              <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-foreground font-semibold mb-1">No scheduled notifications</p>
            <p className="text-text-muted text-sm text-center max-w-sm">
              Scheduled notifications will appear here once created via the API or playground.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card-2">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Next Run
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                    Wallet
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="bg-card hover:bg-card-2 transition-colors">
                    {/* Next run */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">
                        {relativeTime(item.nextRunAt)}
                      </p>
                      <p className="text-[10px] text-text-dim font-mono">
                        {new Date(item.nextRunAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          item.scheduleType === "RECURRING"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}
                      >
                        {item.scheduleType === "RECURRING" ? "Recurring" : "One-Time"}
                      </span>
                      {item.scheduleType === "RECURRING" && item.cronExpr && (
                        <p className="text-[10px] font-mono text-text-dim mt-0.5">{item.cronExpr}</p>
                      )}
                    </td>

                    {/* Wallet */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {item.wallet ? (
                        <code className="text-xs font-mono text-text-muted">
                          {truncateWallet(item.wallet)}
                        </code>
                      ) : (
                        <span className="text-text-dim text-xs italic">—</span>
                      )}
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-[180px]">
                        {item.subject}
                      </p>
                      <p className="text-[10px] text-text-dim capitalize">{item.category}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          STATUS_STYLES[item.status]
                        )}
                      >
                        {item.status === "RUNNING" && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                          </span>
                        )}
                        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {(item.status === "PENDING" || item.status === "RUNNING") && (
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleCancel(item.id)}
                          isLoading={cancellingId === item.id}
                          disabled={cancellingId === item.id}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>
                {total.toLocaleString()} total scheduled
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
