"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { AudienceUploader } from "@/components/campaigns/AudienceUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { listAudiences, createAudience, type Audience } from "@/lib/api/audiences";
import { createCampaign, launchCampaign } from "@/lib/api/campaigns";

// ─── Types ───────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface FormData {
  audienceId: string;
  audienceMode: "existing" | "new";
  newAudienceName: string;
  newAudienceWallets: string[];
  subject: string;
  body: string;
  category: string;
  channels: string[];
  launchImmediately: boolean;
}

const INITIAL_FORM: FormData = {
  audienceId: "",
  audienceMode: "existing",
  newAudienceName: "",
  newAudienceWallets: [],
  subject: "",
  body: "",
  category: "defi",
  channels: ["email"],
  launchImmediately: false,
};

const STEP_LABELS = ["Audience", "Message", "Review & Launch"];

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

// ─── Step Progress ────────────────────────────────────────────

function StepIndicator({ step, total }: { step: Step; total: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const n = (i + 1) as Step;
        const isDone = n < step;
        const isActive = n === step;
        return (
          <div key={n} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all",
                isActive && "border-teal bg-teal/10 text-teal",
                isDone && "border-teal/40 bg-teal/20 text-teal",
                !isActive && !isDone && "border-border bg-card-2 text-text-muted"
              )}
            >
              {isDone ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                n
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                isActive ? "text-foreground" : "text-text-muted"
              )}
            >
              {STEP_LABELS[i]}
            </span>
            {i < total - 1 && (
              <div className={cn("h-px w-8", isDone ? "bg-teal/40" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isBusy, setIsBusy] = useState(false);
  const [resolvedAudience, setResolvedAudience] = useState<Audience | null>(null);

  const { data: audiences = [], isLoading: audiencesLoading } = useQuery({
    queryKey: ["audiences"],
    queryFn: listAudiences,
    staleTime: 30_000,
  });

  const selectedAudience =
    form.audienceMode === "existing"
      ? audiences.find((a) => a.id === form.audienceId) ?? null
      : resolvedAudience;

  // ── Step 1: Audience ──────────────────────────────────────

  const handleStep1Next = async () => {
    if (form.audienceMode === "new") {
      if (!form.newAudienceName.trim()) {
        toast.error("Please enter a name for the new audience.");
        return;
      }
      if (form.newAudienceWallets.length === 0) {
        toast.error("Please add at least one valid wallet address.");
        return;
      }
      setIsBusy(true);
      try {
        const aud = await createAudience({
          name: form.newAudienceName.trim(),
          wallets: form.newAudienceWallets,
        });
        setResolvedAudience(aud);
        setForm((f) => ({ ...f, audienceId: aud.id }));
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to create audience.");
        return;
      } finally {
        setIsBusy(false);
      }
    } else {
      if (!form.audienceId) {
        toast.error("Please select an audience.");
        return;
      }
    }
    setStep(2);
  };

  // ── Step 2: Message ───────────────────────────────────────

  const handleStep2Next = () => {
    if (!form.subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Please enter a message body.");
      return;
    }
    if (form.channels.length === 0) {
      toast.error("Please select at least one channel.");
      return;
    }
    setStep(3);
  };

  // ── Step 3: Create Draft ──────────────────────────────────

  const handleCreateDraft = async () => {
    setIsBusy(true);
    try {
      const campaign = await createCampaign({
        audienceId: form.audienceId,
        subject: form.subject.trim(),
        body: form.body.trim(),
        category: form.category,
        channels: form.channels,
      });

      if (form.launchImmediately) {
        await launchCampaign(campaign.id);
        toast.success("Campaign created and launched.");
      } else {
        toast.success("Campaign draft created.");
      }

      router.push("/campaigns");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create campaign.");
    } finally {
      setIsBusy(false);
    }
  };

  const toggleChannel = (ch: string) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter((c) => c !== ch)
        : [...f.channels, ch],
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="New Campaign"
        description="Send a broadcast notification to an audience group."
      />

      {/* Step indicator */}
      <StepIndicator step={step} total={3} />

      {/* ── Step 1: Audience ── */}
      {step === 1 && (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">Select Audience</h2>
              <p className="text-xs text-text-muted">
                Choose an existing audience or create a new one from wallet addresses.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["existing", "new"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, audienceMode: mode }))}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold transition-colors",
                    form.audienceMode === mode
                      ? "bg-teal/10 text-teal border-r-0"
                      : "bg-card-2 text-text-muted hover:text-foreground"
                  )}
                >
                  {mode === "existing" ? "Use Existing" : "Create New"}
                </button>
              ))}
            </div>

            {form.audienceMode === "existing" ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">Audience</label>
                {audiencesLoading ? (
                  <div className="h-9 rounded-lg bg-card-2 border border-border animate-pulse" />
                ) : audiences.length === 0 ? (
                  <p className="text-sm text-text-muted py-2">
                    No audiences yet.{" "}
                    <button
                      type="button"
                      className="text-teal underline"
                      onClick={() => setForm((f) => ({ ...f, audienceMode: "new" }))}
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <Select
                    value={form.audienceId}
                    onValueChange={(val) => setForm((f) => ({ ...f, audienceId: val }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an audience…" />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((aud) => (
                        <SelectItem key={aud.id} value={aud.id}>
                          {aud.name}{" "}
                          <span className="text-text-dim ml-1">
                            ({aud.walletCount.toLocaleString()} wallets)
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Audience Name</label>
                  <Input
                    value={form.newAudienceName}
                    onChange={(e) => setForm((f) => ({ ...f, newAudienceName: e.target.value }))}
                    placeholder="e.g., SOL Stakers Q2"
                    className="bg-card-2"
                  />
                </div>
                <AudienceUploader
                  onWallets={(wallets) => setForm((f) => ({ ...f, newAudienceWallets: wallets }))}
                  value={form.newAudienceWallets}
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={handleStep1Next} isLoading={isBusy}>
                Next: Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Message ── */}
      {step === 2 && (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">Compose Message</h2>
              <p className="text-xs text-text-muted">Write the notification content for your campaign.</p>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">Subject</label>
                <span className={cn("text-[10px]", form.subject.length > 180 ? "text-amber-400" : "text-text-dim")}>
                  {form.subject.length}/200
                </span>
              </div>
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value.slice(0, 200) }))}
                placeholder="e.g., Important update for your portfolio"
                className="bg-card-2"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">Body</label>
                <span className={cn("text-[10px]", form.body.length > 9000 ? "text-amber-400" : "text-text-dim")}>
                  {form.body.length.toLocaleString()}/10,000
                </span>
              </div>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value.slice(0, 10000) }))}
                placeholder="Write your notification body here. Markdown is supported."
                className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-teal resize-none"
                rows={6}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Category</label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm((f) => ({ ...f, category: val }))}
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
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary">Channels</label>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((ch) => {
                  const checked = form.channels.includes(ch.value);
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

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleStep2Next}>Next: Review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Review & Launch ── */}
      {step === 3 && (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">Review Campaign</h2>
              <p className="text-xs text-text-muted">Confirm your campaign details before creating.</p>
            </div>

            {/* Summary */}
            <div className="rounded-lg border border-border bg-card-2 divide-y divide-border text-sm">
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20 shrink-0 mt-0.5">
                  Audience
                </span>
                <div>
                  <p className="text-foreground font-medium">
                    {selectedAudience?.name ?? "—"}
                  </p>
                  {selectedAudience && (
                    <p className="text-xs text-text-muted">
                      {selectedAudience.walletCount.toLocaleString()} wallets
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20 shrink-0 mt-0.5">
                  Subject
                </span>
                <p className="text-foreground">{form.subject}</p>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20 shrink-0 mt-0.5">
                  Body
                </span>
                <p className="text-text-muted text-xs whitespace-pre-wrap line-clamp-4">
                  {form.body}
                </p>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20 shrink-0 mt-0.5">
                  Category
                </span>
                <p className="text-foreground capitalize">
                  {CATEGORY_OPTIONS.find((c) => c.value === form.category)?.label ?? form.category}
                </p>
              </div>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20 shrink-0 mt-0.5">
                  Channels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {form.channels.map((ch) => (
                    <span
                      key={ch}
                      className="text-[10px] font-semibold bg-teal/10 text-teal border border-teal/20 px-2 py-0.5 rounded-full capitalize"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch immediately toggle */}
            <label className="flex items-start gap-3 p-3 bg-card-2 border border-border rounded-lg cursor-pointer hover:border-border-2 transition-colors">
              <input
                type="checkbox"
                className="mt-0.5 rounded w-4 h-4"
                checked={form.launchImmediately}
                onChange={(e) => setForm((f) => ({ ...f, launchImmediately: e.target.checked }))}
              />
              <div>
                <p className="text-xs font-semibold text-foreground">Launch immediately</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Send the campaign right after creation. Leave unchecked to save as a draft.
                </p>
              </div>
            </label>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleCreateDraft} isLoading={isBusy}>
                {form.launchImmediately ? "Create & Launch" : "Create Draft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
