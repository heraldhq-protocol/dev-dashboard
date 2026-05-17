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

export default function CampaignsPage() {
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
