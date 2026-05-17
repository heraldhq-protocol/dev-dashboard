"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { CampaignProgressCard } from "@/components/campaigns/CampaignProgressCard";

import {
  listCampaigns,
  launchCampaign,
  cancelCampaign,
  type Campaign,
} from "@/lib/api/campaigns";
import { usePlanGate } from "@/hooks/usePlanGate";

export default function CampaignsPage() {
  const { tier } = usePlanGate();

  if (tier >= 1) {
    return <CampaignsContent />;
  }

  return <CampaignPreview />;
}

function CampaignPreview() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Broadcast notifications to audience groups."
        actions={
          <Button disabled>
            New Campaign
          </Button>
        }
      />

      <div className="relative">
        {/* Blurred dummy table */}
        <div className="pointer-events-none select-none blur-sm opacity-40 rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card-2">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Audience</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Targets</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Sent</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Dummy row 1 */}
              <tr className="bg-card">
                <td className="px-4 py-3">
                  <CampaignStatusBadge status="COMPLETED" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground truncate max-w-[200px]">Liquidation Warning Blast</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-text-muted text-xs">DeFi Power Users</span>
                  <span className="ml-1.5 text-[10px] text-text-dim">(12,450)</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-text-muted">12,450</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-teal">12,438</span>
                  <span className="ml-1.5 font-mono text-xs text-red-400">/ 12 failed</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-text-dim">4/28/2026</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5" />
                </td>
              </tr>
              {/* Dummy row 2 */}
              <tr className="bg-card">
                <td className="px-4 py-3">
                  <CampaignStatusBadge status="RUNNING" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground truncate max-w-[200px]">Governance Vote — Q2 2026</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-text-muted text-xs">Governance Participants</span>
                  <span className="ml-1.5 text-[10px] text-text-dim">(8,200)</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-text-muted">8,200</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-teal">6,102</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-text-dim">5/10/2026</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5" />
                </td>
              </tr>
              {/* Dummy row 3 */}
              <tr className="bg-card">
                <td className="px-4 py-3">
                  <CampaignStatusBadge status="DRAFT" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground truncate max-w-[200px]">Staking Rewards Update</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-text-muted text-xs">Stakers</span>
                  <span className="ml-1.5 text-[10px] text-text-dim">(5,500)</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-text-muted">5,500</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-teal">—</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-text-dim">5/14/2026</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-6 py-8 rounded-2xl border border-border bg-card/90 backdrop-blur-sm shadow-xl max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-teal/10 border border-teal/20">
              <svg className="w-6 h-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Campaigns require Growth plan</h3>
            <p className="text-sm text-text-muted mb-5">
              Target specific wallet segments with broadcast campaigns.
            </p>
            <a
              href="/billing#billing-plans"
              className="inline-flex items-center justify-center rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90 transition-colors w-full mb-3"
            >
              Upgrade to Growth — $99/mo
            </a>
            <a
              href="/billing#billing-plans"
              className="text-xs text-text-muted hover:text-foreground transition-colors"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: listCampaigns,
    refetchInterval: (query) => {
      const hasRunning = (query.state.data ?? []).some((c) => c.status === "RUNNING");
      return hasRunning ? 10_000 : false;
    },
  });

  const handleLaunch = async (id: string) => {
    setLoadingId(id);
    try {
      await launchCampaign(id);
      toast.success("Campaign launched.");
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to launch campaign.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setLoadingId(id);
    try {
      await cancelCampaign(id);
      toast.success("Campaign cancelled.");
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to cancel campaign.");
    } finally {
      setLoadingId(null);
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
        title="Campaigns"
        description="Broadcast notifications to audience groups."
        actions={
          <Button onClick={() => router.push("/campaigns/new")}>
            New Campaign
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-teal/10 border border-teal/20">
              <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="text-foreground font-semibold mb-1">No campaigns yet</p>
            <p className="text-text-muted text-sm mb-5 text-center max-w-sm">
              Create a campaign to send bulk notifications to your audience groups.
            </p>
            <Button onClick={() => router.push("/campaigns/new")}>
              New Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card-2">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Audience</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Targets</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Sent</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  isLoading={loadingId === campaign.id}
                  onLaunch={handleLaunch}
                  onCancel={handleCancel}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CampaignRow({
  campaign,
  isLoading,
  onLaunch,
  onCancel,
}: {
  campaign: Campaign;
  isLoading: boolean;
  onLaunch: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const canLaunch = campaign.status === "DRAFT" || campaign.status === "SCHEDULED";
  const canCancel = campaign.status === "RUNNING" || campaign.status === "SCHEDULED";

  return (
    <>
      <tr className="bg-card hover:bg-card-2 transition-colors">
        <td className="px-4 py-3">
          <CampaignStatusBadge status={campaign.status} />
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-foreground truncate max-w-[200px]">{campaign.subject}</p>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="text-text-muted text-xs">
            {campaign.audience?.name ?? <span className="italic opacity-60">—</span>}
          </span>
          {campaign.audience && (
            <span className="ml-1.5 text-[10px] text-text-dim">
              ({campaign.audience.walletCount.toLocaleString()})
            </span>
          )}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="font-mono text-xs text-text-muted">
            {campaign.totalTargets.toLocaleString()}
          </span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="font-mono text-xs text-teal">
            {campaign.totalSent.toLocaleString()}
          </span>
          {campaign.totalFailed > 0 && (
            <span className="ml-1.5 font-mono text-xs text-red-400">
              / {campaign.totalFailed.toLocaleString()} failed
            </span>
          )}
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="text-xs text-text-dim">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {canLaunch && (
              <Button
                size="xs"
                onClick={() => onLaunch(campaign.id)}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Launch
              </Button>
            )}
            {canCancel && (
              <Button
                size="xs"
                variant="destructive"
                onClick={() => onCancel(campaign.id)}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </td>
      </tr>
      {campaign.status === "RUNNING" && (
        <tr className="bg-card">
          <td colSpan={7} className="px-4 pb-3">
            <CampaignProgressCard campaign={campaign} />
          </td>
        </tr>
      )}
    </>
  );
}
