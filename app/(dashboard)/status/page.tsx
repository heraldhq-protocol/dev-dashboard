"use client";

import { useQuery } from "@tanstack/react-query";
import { getProtocolStatus } from "@/lib/api/protocol";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FiShield, FiActivity, FiZap } from "react-icons/fi";

export default function StatusPage() {
  const { data: status, isLoading, error } = useQuery({
    queryKey: ["protocolStatus"],
    queryFn: getProtocolStatus,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 bg-teal/20 rounded-full" />
          <div className="text-text-muted">Loading protocol health…</div>
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
    (status.sendsUsed / Math.max(1, status.sendsLimit)) * 100
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Status</h1>
        <p className="text-sm text-text-muted mt-1">
          Monitor your protocol&apos;s on-chain health and messaging quotas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-2 p-5 bg-navy-2 border-border">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-1">
            <FiActivity size={16} />
            Protocol Status
          </div>
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <>
                <div className="h-3 w-3 bg-teal rounded-full shadow-[0_0_10px_rgba(46,213,115,0.5)]" />
                <span className="text-xl font-bold text-white">Active</span>
              </>
            ) : status.isSuspended ? (
              <>
                <div className="h-3 w-3 bg-red rounded-full shadow-[0_0_10px_rgba(255,71,87,0.5)]" />
                <span className="text-xl font-bold text-white">Suspended</span>
              </>
            ) : (
              <>
                <div className="h-3 w-3 bg-gold rounded-full shadow-[0_0_10px_rgba(255,165,2,0.5)]" />
                <span className="text-xl font-bold text-white">Inactive</span>
              </>
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-5 bg-navy-2 border-border">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-1">
            <FiShield size={16} />
            On-Chain Program
          </div>
          <div className="font-bold text-white tracking-tight break-all font-mono text-sm leading-tight">
            {status.programId?.slice(0, 16)}…
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-5 bg-navy-2 border-border">
          <div className="flex items-center justify-between text-text-muted text-sm font-medium mb-1">
            <div className="flex items-center gap-2">
              <FiZap size={16} />
              Subscription Tier
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {status.tierName}
            </Badge>
          </div>
          <div className="text-xl font-bold text-white capitalize">
            {status.subscriptionStatus}
          </div>
          {status.subscriptionExpiry && (
            <div className="text-xs text-text-dim">
              Renews {new Date(status.subscriptionExpiry).toLocaleDateString()}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-2 p-5 bg-navy-2 border-border">
          <div className="flex items-center justify-between text-text-muted text-sm font-medium mb-1">
            <span>Send Quota Usage</span>
            <span className="text-teal font-mono">{usagePercent.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 w-full bg-navy rounded-full overflow-hidden">
            <div
              className={`h-full ${
                usagePercent > 90 ? "bg-red" : usagePercent > 75 ? "bg-gold" : "bg-teal"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="text-xs text-text-dim mt-1 font-mono">
            {status.sendsUsed.toLocaleString()} / {status.sendsLimit.toLocaleString()}
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-white mb-2">Protocol Deactivation</h2>
        <p className="text-sm text-text-muted max-w-2xl mb-6">
          Deactivating your protocol will pause all outgoing notifications immediately. This action
          must be confirmed on-chain prior to resuming service. If you are experiencing an attack,
          suspend your webhooks instead.
        </p>
        <Button variant="danger">Request Deactivation</Button>
      </div>
    </div>
  );
}
