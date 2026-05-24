"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { CampaignProgressCard } from "@/components/campaigns/CampaignProgressCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getCampaign,
  updateCampaign,
  launchCampaign,
  cancelCampaign,
} from "@/lib/api/campaigns";

const CATEGORY_OPTIONS = [
  { value: "defi", label: "DeFi Alerts" },
  { value: "governance", label: "Governance" },
  { value: "marketing", label: "Marketing" },
  { value: "system", label: "System Events" },
];

const CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "telegram", label: "Telegram" },
  { value: "sms", label: "SMS" },
];

export default function CampaignDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaign(id),
    refetchInterval: (query) =>
      query.state.data?.status === "RUNNING" ? 8_000 : false,
  });

  const isDraft = campaign?.status === "DRAFT";

  // Edit state — only relevant for DRAFT
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{
    subject: string;
    body: string;
    category: string;
    channels: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const startEdit = () => {
    if (!campaign) return;
    setForm({
      subject: campaign.subject,
      body: campaign.body,
      category: campaign.category,
      channels: campaign.channels,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(null);
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      await updateCampaign(id, {
        subject: form.subject.trim(),
        body: form.body.trim(),
        category: form.category,
        channels: form.channels,
      });
      toast.success("Campaign updated.");
      await queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setEditing(false);
      setForm(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save campaign.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaunch = async () => {
    setIsActing(true);
    try {
      await launchCampaign(id);
      toast.success("Campaign launched.");
      await queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to launch campaign.");
    } finally {
      setIsActing(false);
    }
  };

  const handleCancel = async () => {
    setIsActing(true);
    try {
      await cancelCampaign(id);
      toast.success("Campaign cancelled.");
      router.push("/campaigns");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to cancel campaign.");
      setIsActing(false);
    }
  };

  const toggleChannel = (ch: string) => {
    if (!form) return;
    setForm((f) =>
      f
        ? {
            ...f,
            channels: f.channels.includes(ch)
              ? f.channels.filter((c) => c !== ch)
              : [...f.channels, ch],
          }
        : f
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <RippleWaveLoader />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
        </Link>
        <p className="text-text-muted">Campaign not found.</p>
      </div>
    );
  }

  const displaySubject = editing && form ? form.subject : campaign.subject;
  const displayBody = editing && form ? form.body : campaign.body;
  const displayCategory = editing && form ? form.category : campaign.category;
  const displayChannels = editing && form ? form.channels : campaign.channels;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="text-text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          title={campaign.subject}
          description={`Campaign · ${campaign.audience?.name ?? "Unknown audience"}`}
          actions={
            <div className="flex items-center gap-2">
              <CampaignStatusBadge status={campaign.status} />
              {isDraft && !editing && (
                <>
                  <Button size="sm" variant="secondary" onClick={startEdit}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleLaunch}
                    isLoading={isActing}
                    disabled={isActing}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Launch
                  </Button>
                </>
              )}
              {editing && (
                <>
                  <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={isSaving}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Progress bar for RUNNING campaigns */}
      {campaign.status === "RUNNING" && (
        <CampaignProgressCard campaign={campaign} />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Targets", value: campaign.totalTargets.toLocaleString() },
          { label: "Sent", value: campaign.totalSent.toLocaleString(), color: "text-teal" },
          { label: "Failed", value: campaign.totalFailed.toLocaleString(), color: campaign.totalFailed > 0 ? "text-red" : undefined },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">{label}</p>
            <p className={cn("text-lg font-bold", color ?? "text-foreground")}>{value}</p>
          </div>
        ))}
      </div>

      {/* Campaign details / edit form */}
      <Card className="border border-border">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Message</h2>

          {/* Subject */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary">Subject</label>
              {editing && (
                <span className={cn("text-[10px]", (form?.subject.length ?? 0) > 180 ? "text-amber-400" : "text-text-dim")}>
                  {form?.subject.length ?? 0}/200
                </span>
              )}
            </div>
            {editing ? (
              <Input
                value={form?.subject ?? ""}
                onChange={(e) =>
                  setForm((f) => f ? { ...f, subject: e.target.value.slice(0, 200) } : f)
                }
                className="bg-card-2"
              />
            ) : (
              <p className="text-sm text-foreground py-2 px-3 rounded-lg bg-card-2 border border-border">
                {displaySubject}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary">Body</label>
              {editing && (
                <span className={cn("text-[10px]", (form?.body.length ?? 0) > 9000 ? "text-amber-400" : "text-text-dim")}>
                  {(form?.body.length ?? 0).toLocaleString()}/10,000
                </span>
              )}
            </div>
            {editing ? (
              <textarea
                value={form?.body ?? ""}
                onChange={(e) =>
                  setForm((f) => f ? { ...f, body: e.target.value.slice(0, 10000) } : f)
                }
                className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-teal resize-none"
                rows={6}
              />
            ) : (
              <p className="text-sm text-foreground py-2 px-3 rounded-lg bg-card-2 border border-border whitespace-pre-wrap">
                {displayBody}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Category</label>
            {editing ? (
              <Select
                value={form?.category ?? "defi"}
                onValueChange={(val) =>
                  setForm((f) => f ? { ...f, category: val } : f)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-foreground py-2 px-3 rounded-lg bg-card-2 border border-border capitalize">
                {CATEGORY_OPTIONS.find((c) => c.value === displayCategory)?.label ?? displayCategory}
              </p>
            )}
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">Channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map((ch) => {
                const checked = displayChannels.includes(ch.value);
                if (!editing) {
                  return checked ? (
                    <span
                      key={ch.value}
                      className="text-[10px] font-semibold bg-teal/10 text-teal border border-teal/20 px-2.5 py-1 rounded-full"
                    >
                      {ch.label}
                    </span>
                  ) : null;
                }
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => toggleChannel(ch.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      checked
                        ? "border-teal/40 bg-teal/10 text-teal"
                        : "border-border bg-card-2 text-text-muted hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors",
                        checked ? "border-teal bg-teal" : "border-border"
                      )}
                    >
                      {checked && (
                        <svg className="h-2.5 w-2.5 text-navy" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-7-1-1z" />
                        </svg>
                      )}
                    </span>
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Details</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: "Audience", value: campaign.audience?.name ?? "—" },
              { label: "Wallet Count", value: campaign.audience?.walletCount.toLocaleString() ?? "—" },
              { label: "Created", value: new Date(campaign.createdAt).toLocaleString() },
              ...(campaign.startedAt ? [{ label: "Started", value: new Date(campaign.startedAt).toLocaleString() }] : []),
              ...(campaign.completedAt ? [{ label: "Completed", value: new Date(campaign.completedAt).toLocaleString() }] : []),
              ...(campaign.scheduledFor ? [{ label: "Scheduled For", value: new Date(campaign.scheduledFor).toLocaleString() }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">{label}</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel button for DRAFT/SCHEDULED */}
      {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && !editing && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            isLoading={isActing}
            disabled={isActing}
          >
            Cancel Campaign
          </Button>
        </div>
      )}
    </div>
  );
}
