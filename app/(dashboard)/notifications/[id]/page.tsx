"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/notifications/StatusBadge";
import { ReceiptProof } from "@/components/notifications/ReceiptProof";
import { SyntaxBlock } from "@/components/shared/SyntaxBlock";
import { FaChevronLeft } from "react-icons/fa";
import { Copy, Check, AlertCircle } from "lucide-react";
import { getNotificationById } from "@/lib/api/notifications";
import { NotificationDetailDto } from "@/types/api";

function CopyChip({ value, display }: { value: string; display: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-foreground transition-colors group"
      title={value}
    >
      <span className="truncate max-w-[220px]">{display}</span>
      {copied
        ? <Check className="h-3 w-3 text-teal shrink-0" />
        : <Copy className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

function formatTs(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border-2/60 ${className ?? ""}`} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl w-full pt-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-5 w-20 ml-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-2 border border-border-2 rounded-xl p-6 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="space-y-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-navy-2 border border-border-2 rounded-xl p-6 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
      <div className="bg-navy-2 border border-border-2 rounded-xl p-6 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export default function NotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { data: notification, isLoading, isError } = useQuery<NotificationDetailDto>({
    queryKey: ["notification", id],
    queryFn: () => getNotificationById(id),
    staleTime: 30_000,
    retry: 1,
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !notification) {
    return (
      <div className="max-w-4xl w-full pt-4 space-y-6">
        <Button
          variant="ghost"
          className="text-text-muted hover:text-foreground px-2 h-auto py-1 gap-2 cursor-pointer"
          onClick={() => router.back()}
        >
          <FaChevronLeft /> Back
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <AlertCircle className="h-8 w-8 text-red opacity-70" />
          <p className="text-sm font-medium text-foreground">Notification not found</p>
          <p className="text-xs text-text-muted">
            This notification may have been pruned or the ID is invalid.
          </p>
        </div>
      </div>
    );
  }

  const walletDisplay = notification.walletHash.length > 12
    ? `${notification.walletHash.slice(0, 5)}...${notification.walletHash.slice(-5)}`
    : notification.walletHash;

  const idDisplay = `${id.slice(0, 8)}...${id.slice(-8)}`;

  const categoryLabel: Record<string, string> = {
    defi: "DeFi Alerts",
    governance: "Governance",
    system: "System",
    marketing: "Marketing",
  };

  const rawPayload = notification.payload
    ? JSON.stringify(notification.payload, null, 2)
    : JSON.stringify({ id: notification.id, walletHash: notification.walletHash, category: notification.category, status: notification.status }, null, 2);

  return (
    <div className="space-y-6 max-w-4xl w-full pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          className="text-text-muted hover:text-foreground px-2 h-auto py-1 gap-2 cursor-pointer shrink-0"
          onClick={() => router.back()}
        >
          <FaChevronLeft /> Back
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-text-muted text-sm hidden sm:block">Notification</span>
          <CopyChip value={id} display={idDisplay} />
        </div>

        <div className="ml-auto shrink-0">
          <StatusBadge status={notification.status} />
        </div>
      </div>

      {/* Metadata + Payload grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Metadata */}
        <div className="bg-navy-2 border border-border-2 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Delivery Metadata
          </h3>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3.5 text-sm items-center">
            <dt className="text-text-muted whitespace-nowrap">Wallet</dt>
            <dd>
              <CopyChip value={notification.walletHash} display={walletDisplay} />
            </dd>

            <dt className="text-text-muted whitespace-nowrap">Category</dt>
            <dd className="text-foreground capitalize">
              {categoryLabel[notification.category] ?? notification.category}
            </dd>

            {notification.channel && (
              <>
                <dt className="text-text-muted whitespace-nowrap">Channel</dt>
                <dd className="text-foreground capitalize">{notification.channel}</dd>
              </>
            )}

            <dt className="text-text-muted whitespace-nowrap">Queued at</dt>
            <dd className="text-foreground text-xs">{formatTs(notification.queuedAt)}</dd>

            <dt className="text-text-muted whitespace-nowrap">Delivered at</dt>
            <dd className="text-foreground text-xs">{formatTs(notification.deliveredAt)}</dd>

            {notification.errorCode && (
              <>
                <dt className="text-text-muted whitespace-nowrap">Error</dt>
                <dd className="text-red text-xs font-mono">{notification.errorCode}</dd>
              </>
            )}

            {notification.errorReason && (
              <>
                <dt className="text-text-muted whitespace-nowrap">Reason</dt>
                <dd className="text-red text-xs">{notification.errorReason}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Raw Payload */}
        <div className="bg-navy-2 border border-border-2 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Raw Transport Payload
          </h3>
          <div className="flex-1 overflow-hidden relative min-h-[160px]">
            <SyntaxBlock code={rawPayload} className="h-full bg-card" />
          </div>
        </div>
      </div>

      {/* On-Chain Receipt — full width */}
      <div className="bg-navy-2 border border-border-2 rounded-xl p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
          On-Chain Receipt
        </h3>
        <ReceiptProof
          receiptTx={notification.receiptTx}
          status={notification.status}
          errorCode={notification.errorCode}
          receiptFailureReason={notification.receiptFailureReason}
        />
      </div>
    </div>
  );
}
