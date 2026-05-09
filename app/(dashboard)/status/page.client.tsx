"use client";

import { useQuery } from "@tanstack/react-query";
import { getProtocolStatus } from "@/lib/api/protocol";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FiShield, FiActivity, FiZap } from "react-icons/fi";
import { PageHeader } from "@/components/shared/PageHeader";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";

export default function StatusPage() {
  const {
    data: status,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["protocolStatus"],
    queryFn: getProtocolStatus,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RippleWaveLoader />
          <div className="text-text-muted mt-2">Loading protocol health…</div>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="p-8 text-center text-red">
        Failed to load protocol status. Please try again later.
      </div>
    );
  }

  const isHealthy = status.isActive && !status.isSuspended;
  const usagePercent = Math.min(
    100,
    (status.sendsUsed / Math.max(1, status.sendsLimit)) * 100,
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="System Status"
        description="Monitor your protocol's on-chain health and messaging quotas."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          variant="glow"
          className="flex flex-col gap-2 p-5 bg-card border-border shadow-sm"
        >
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-1">
            <FiActivity size={16} />
            Protocol Status
          </div>
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <>
                <div className="h-3 w-3 bg-teal rounded-full shadow-[0_0_10px_rgba(46,213,115,0.5)]" />
                <span className="text-xl font-bold text-foreground">Active</span>
              </>
            ) : status.isSuspended ? (
              <>
                <div className="h-3 w-3 bg-red rounded-full shadow-[0_0_10px_rgba(255,71,87,0.5)]" />
                <span className="text-xl font-bold text-foreground">Suspended</span>
              </>
            ) : (
              <>
                <div className="h-3 w-3 bg-gold rounded-full shadow-[0_0_10px_rgba(255,165,2,0.5)]" />
                <span className="text-xl font-bold text-foreground">Inactive</span>
              </>
            )}
          </div>
        </Card>

        <Card
          variant="glow"
          className="flex flex-col gap-2 p-5 bg-card border-border shadow-sm"
        >
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-1">
            <FiShield size={16} />
            On-Chain Program
          </div>
          <div className="font-bold text-foreground tracking-tight break-all font-mono text-sm leading-tight">
            {status.programId?.slice(0, 16)}…
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-5 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between text-text-muted text-sm font-medium mb-1">
            <div className="flex items-center gap-2">
              <FiZap size={16} />
              <p className="text-xs">Subscription Tier</p>
            </div>
            <Badge
              variant="default"
              className="text-xs uppercase tracking-wider"
            >
              {status.tierName.toLowerCase().includes("developer")
                ? "DEV"
                : status.tierName.toLowerCase().includes("growth")
                  ? "GROWTH"
                  : status.tierName.toLowerCase().includes("scale")
                    ? "SCALE"
                    : "ENT"}
            </Badge>
          </div>
          <div className="text-xl font-bold text-foreground capitalize">
            {status.subscriptionStatus}
          </div>
          {status.subscriptionExpiry && (
            <div className="text-xs text-text-secondary">
              Renews {new Date(status.subscriptionExpiry).toLocaleDateString()}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-2 p-5 bg-card border-border shadow-sm">
          <div className="flex items-center justify-between text-text-muted text-sm font-medium mb-1">
            <span>Send Quota Usage</span>
            <span className="text-teal font-mono">
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full bg-secondary dark:bg-navy rounded-full overflow-hidden">
            <div
              className={`h-full ${
                usagePercent > 90
                  ? "bg-red"
                  : usagePercent > 75
                    ? "bg-gold"
                    : "bg-teal"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="text-xs text-text-secondary mt-1 font-mono">
            {status.sendsUsed.toLocaleString()} /{" "}
            {status.sendsLimit.toLocaleString()}
          </div>
        </Card>
      </div>

      <div className="bg-linear-to-br from-red/10 to-transparent border border-red/30 rounded-xl p-8 shadow-[0_0_20px_rgba(255,0,0,0.05)] mt-8">
        <h2 className="text-red font-bold text-lg mb-2 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Protocol Deactivation
        </h2>
        <p className="text-red/80 text-sm max-w-2xl mb-6">
          Deactivating your protocol will pause all outgoing notifications
          immediately. This action must be confirmed on-chain prior to resuming
          service. If you are experiencing an attack, suspend your webhooks
          instead.
        </p>
        <Button variant="destructive">Request Deactivation</Button>
      </div>
    </div>
  );
}
