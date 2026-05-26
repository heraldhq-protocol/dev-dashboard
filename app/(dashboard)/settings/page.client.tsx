"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProtocol, updateProtocol, deactivateProtocol, getSandboxSettings, updateSandboxSettings, getProtocolAssets, createProtocolAsset, deleteProtocolAsset, syncOnChain } from "@/lib/api/protocol";
import { RetryPolicyForm } from "@/components/settings/RetryPolicyForm";
import { apiClient } from "@/lib/api-client";
import { getTwitterAuthUrl, getTwitterStatus, disconnectTwitter } from "@/lib/api/twitter";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useTourControls } from "@/components/onboarding/TourInitializer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Tour & Onboarding settings panel ─────────────────────────────────────────

function TourSettingsPanel() {
  const { tourCompleted, tourSkipped, resetTour } = useOnboardingStore();
  const { restartTour } = useTourControls();

  const statusLabel = tourSkipped
    ? "Skipped"
    : tourCompleted
    ? "Completed"
    : "Not started";

  const statusColor = tourSkipped
    ? "text-gold bg-gold/10 border-gold/20"
    : tourCompleted
    ? "text-green bg-green/10 border-green/20"
    : "text-text-muted bg-white/5 border-white/10";

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Tour &amp; Onboarding</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Manage the interactive product tour that walks you through every section of the Herald dashboard.
          </p>
        </div>
      </div>

      {/* Status card */}
      <div className="rounded-xl border border-border bg-navy-2 p-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Tour Status</p>
          <p className="text-sm text-foreground font-medium">
            {tourCompleted
              ? tourSkipped
                ? "You skipped the tour. Restart anytime below."
                : "You've completed the full onboarding tour."
              : "You haven't taken the tour yet."}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* What the tour covers */}
      <div className="rounded-xl border border-border bg-navy-2 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Tour covers</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { icon: "📊", label: "Overview" },
            { icon: "📈", label: "Analytics" },
            { icon: "🧪", label: "Playground" },
            { icon: "🔑", label: "API Keys" },
            { icon: "⚡", label: "Webhooks" },
            { icon: "📝", label: "Templates" },
            { icon: "🌐", label: "Domains" },
            { icon: "🔔", label: "Notifications" },
            { icon: "💳", label: "Billing" },
            { icon: "👥", label: "Team" },
            { icon: "⚙️", label: "Settings" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-text-secondary">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          id="restart-tour-btn"
          variant="default"
          onClick={restartTour}
        >
          {tourCompleted ? "Restart Tour" : "Start Tour"}
        </Button>
        {tourCompleted && (
          <Button
            variant="ghost"
            className="text-text-dim text-xs"
            onClick={() => {
              resetTour();
              toast.success("Tour reset — it will auto-fire on your next visit.");
            }}
          >
            Reset to auto-fire
          </Button>
        )}
      </div>
    </div>
  );
}


export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "sandbox" | "assets" | "telegram" | "retry" | "x" | "tour" | "danger">("general");
  const [xConnecting, setXConnecting] = useState(false);
  const [xDisconnecting, setXDisconnecting] = useState(false);

  const { data: xStatus, refetch: refetchX } = useQuery({
    queryKey: ["twitterStatus"],
    queryFn: getTwitterStatus,
    staleTime: 30_000,
  });

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["protocol", "me"],
    queryFn: getProtocol,
  });

  const updateMutation = useMutation({
    mutationFn: updateProtocol,
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["protocol"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProtocol,
    onSuccess: () => {
      toast.success("Project deactivated");
      setModalOpen(false);
      window.location.href = "/login";
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    logoUrl: "",
    fromName: "",
  });

  // ── Sandbox state ────────────────────────────────────────────────────────

  const { data: sandboxData } = useQuery({
    queryKey: ["protocol", "sandbox"],
    queryFn: getSandboxSettings,
  });

  const [sandboxForm, setSandboxForm] = useState({
    testEmail: "",
    testTelegramId: "",
    testPhone: "",
  });

  // Sync sandbox form when data loads
  useEffect(() => {
    if (!sandboxData) return;
    setSandboxForm({
      testEmail: sandboxData.testEmail ?? "",
      testTelegramId: sandboxData.testTelegramId ?? "",
      testPhone: sandboxData.testPhone ?? "",
    });
  }, [sandboxData]);

  const sandboxMutation = useMutation({
    mutationFn: updateSandboxSettings,
    onSuccess: () => {
      toast.success("Sandbox contacts saved");
      queryClient.invalidateQueries({ queryKey: ["protocol", "sandbox"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save sandbox settings");
    },
  });

  // Protocol Assets state
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetType, setNewAssetType] = useState<"banner" | "video" | "logo">("banner");

  const { data: assets } = useQuery({
    queryKey: ["protocol", "assets"],
    queryFn: getProtocolAssets,
  });

  const createAssetMutation = useMutation({
    mutationFn: (dto: { assetType: "banner" | "video" | "logo"; url: string }) =>
      createProtocolAsset(dto),
    onSuccess: () => {
      toast.success("Asset added");
      setNewAssetUrl("");
      queryClient.invalidateQueries({ queryKey: ["protocol", "assets"] });
    },
    onError: () => {
      toast.error("Failed to add asset");
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteProtocolAsset,
    onSuccess: () => {
      toast.success("Asset removed");
      queryClient.invalidateQueries({ queryKey: ["protocol", "assets"] });
    },
    onError: () => {
      toast.error("Failed to remove asset");
    },
  });

  const syncOnChainMutation = useMutation({
    mutationFn: syncOnChain,
    onSuccess: (result) => {
      if (result.status === "already_registered") {
        toast.success("Protocol account is already registered on-chain.");
      } else {
        toast.success("Protocol registered on-chain successfully.");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "On-chain sync failed. Check your authority key configuration.");
    },
  });

  // Telegram buttons state
  const [telegramButtonsValue, setTelegramButtonsValue] = useState("");

  const telegramButtonsMutation = useMutation({
    mutationFn: (maxTelegramButtons: string | null) =>
      apiClient.patch("/protocols/me/telegram-buttons", { maxTelegramButtons }),
    onSuccess: () => {
      toast.success("Telegram button limit updated");
      queryClient.invalidateQueries({ queryKey: ["protocol"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update Telegram button limit");
    },
  });

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetUrl) return;
    createAssetMutation.mutate({ assetType: newAssetType, url: newAssetUrl });
  };

  const handleSandboxSave = (e: React.FormEvent) => {
    e.preventDefault();
    sandboxMutation.mutate({
      testEmail: sandboxForm.testEmail || null,
      testTelegramId: sandboxForm.testTelegramId || null,
      testPhone: sandboxForm.testPhone || null,
    });
  };

  // Sync form data when profile loads
  useEffect(() => {
    if (!profile) return;
    setFormData({
      name: profile.protocolName || profile.name || "",
      websiteUrl: profile.website || profile.websiteUrl || "",
      logoUrl: profile.logoUrl || "",
      fromName: profile.customFromName || profile.fromName || "",
    });
  }, [profile]);

  const isValid = inputValue.toLowerCase().trim() === profile?.name?.toLowerCase().trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      protocolName: formData.name,
      website: formData.websiteUrl,
      logoUrl: formData.logoUrl,
      customFromName: formData.fromName,
    });
  };

  if (isLoading) {
    return <div className="text-text-muted">Loading settings…</div>;
  }

  if (isError || !profile) {
    return <div className="text-red-400 text-sm">Failed to load settings. Please refresh.</div>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader 
        title="Project Settings" 
        description="Configure your protocol identity and sender preferences." 
      />

      <div className="flex space-x-1 border-b border-border mb-6 overflow-x-auto">
        {[
          { id: "general", label: "General" },
          { id: "sandbox", label: "Sandbox Test Contacts" },
          { id: "assets", label: "Brand Assets" },
          { id: "telegram", label: "Telegram" },
          { id: "retry", label: "Retry & Engagement" },
          { id: "x", label: "X Account" },
          { id: "tour", label: "Tour & Onboarding" },
          { id: "danger", label: "Danger Zone" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-teal text-teal"
                : "border-transparent text-text-muted hover:text-foreground hover:border-border-2"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
      {activeTab === "general" && (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h2 className="text-lg font-bold text-foreground mb-6">
          General Information
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Protocol ID
              </label>
              <Input
                value={profile?.protocolId || profile?.id || ""}
                disabled
                className="w-full bg-card-2 text-text-muted cursor-not-allowed font-mono text-xs"
              />
              <p className="text-xs text-text-muted mt-1">
                Immutable unique identifier
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Project Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Website URL
              </label>
              <Input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, websiteUrl: e.target.value }))
                }
                placeholder="https://..."
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Brand Logo URL
              </label>
              <Input
                type="url"
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, logoUrl: e.target.value }))
                }
                placeholder="https://..."
                className="w-full"
              />
            </div>
          </div>

          <hr className="border-border" />

          <h2 className="text-lg font-bold text-foreground pt-2">Sender Identity</h2>
          <div className="space-y-1.5 max-w-md">
            <label className="text-sm font-medium text-text-secondary">{`"From" Name`}</label>
            <Input
              value={formData.fromName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fromName: e.target.value }))
              }
              placeholder="e.g. Herald Updates"
              className="w-full"
            />
            <p className="text-xs text-text-muted mt-1">
              This appears as the sender name in email bridging.
            </p>
          </div>

          <div className="pt-6 flex items-center gap-4 border-t border-border">
            <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
            {updateMutation.isSuccess && (
              <span className="text-sm text-green flex items-center gap-1.5 animate-in fade-in duration-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved successfully
              </span>
            )}
          </div>
        </form>

        <hr className="border-border mt-8" />

        {/* On-chain registration */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">On-chain Registration</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Herald writes ZK delivery receipts against your on-chain protocol account. If registration
                failed during signup, use this to retry. Safe to run multiple times.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-navy-2 p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Protocol Pubkey</p>
              <p className="text-sm font-mono text-foreground break-all">{profile?.protocolPubkey ?? "—"}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              isLoading={syncOnChainMutation.isPending}
              disabled={syncOnChainMutation.isPending}
              onClick={() => syncOnChainMutation.mutate()}
              className="shrink-0"
            >
              Sync On-chain
            </Button>
          </div>

          {syncOnChainMutation.isSuccess && syncOnChainMutation.data?.tx && (
            <p className="text-xs text-text-muted animate-in fade-in duration-300">
              Tx:{" "}
              <span className="font-mono text-teal break-all">{syncOnChainMutation.data.tx}</span>
            </p>
          )}
        </div>
      </div>
      )}

      {activeTab === "sandbox" && (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Sandbox Test Contacts</h2>
            <p className="text-sm text-text-muted mt-0.5">
              Notifications sent with <code className="text-xs bg-card-2 px-1 py-0.5 rounded font-mono text-amber-400">hrld_test_</code> keys will be delivered to these addresses instead of real wallets.
            </p>
          </div>
        </div>

        <form onSubmit={handleSandboxSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Test Email
              </label>
              <Input
                type="email"
                id="sandbox-test-email"
                value={sandboxForm.testEmail}
                onChange={(e) => setSandboxForm((p) => ({ ...p, testEmail: e.target.value }))}
                placeholder="dev@yourprotocol.xyz"
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Telegram Chat ID
              </label>
              <Input
                id="sandbox-telegram-id"
                value={sandboxForm.testTelegramId}
                onChange={(e) => setSandboxForm((p) => ({ ...p, testTelegramId: e.target.value }))}
                placeholder="123456789"
                className="w-full"
              />
              <p className="text-xs text-text-muted">Send <code className="bg-card-2 px-1 rounded font-mono">/start</code> to @useheraldbot to get your ID</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Test Phone (SMS)
              </label>
              <Input
                id="sandbox-test-phone"
                value={sandboxForm.testPhone}
                onChange={(e) => setSandboxForm((p) => ({ ...p, testPhone: e.target.value }))}
                placeholder="+14155552671"
                className="w-full"
              />
              <p className="text-xs text-text-muted">E.164 format — e.g. +14155552671</p>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4 border-t border-border">
            <Button type="submit" variant="default" isLoading={sandboxMutation.isPending}>
              Save Sandbox Contacts
            </Button>
            {sandboxMutation.isSuccess && (
              <span className="text-sm text-green flex items-center gap-1.5 animate-in fade-in duration-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </form>
      </div>
      )}

      {activeTab === "assets" && (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h2 className="text-lg font-bold text-foreground mb-6">
          Brand Assets
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Add banner, video, and logo assets for rich notifications on Telegram and Email.
        </p>

        <form onSubmit={handleAddAsset} className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-text-secondary block mb-1.5">
              Asset Type
            </label>
            <Select
              value={newAssetType}
              onValueChange={(val) => setNewAssetType(val as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="logo">Logo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-2">
            <label className="text-sm font-medium text-text-secondary block mb-1.5">
              Asset URL
            </label>
            <Input
              value={newAssetUrl}
              onChange={(e) => setNewAssetUrl(e.target.value)}
              placeholder="https://..."
              className="w-full"
            />
          </div>
          <Button type="submit" variant="default" isLoading={createAssetMutation.isPending} disabled={!newAssetUrl}>
            Add
          </Button>
        </form>

        <div className="space-y-2">
          {assets?.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between p-3 bg-card-2 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase px-2 py-1 bg-primary/10 text-primary rounded">
                  {asset.assetType}
                </span>
                <span className="text-sm text-text-muted truncate max-w-md">{asset.url}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteAssetMutation.mutate(asset.id)}
                className="text-red hover:text-red"
              >
                Remove
              </Button>
            </div>
          ))}
          {(!assets || assets.length === 0) && (
            <p className="text-sm text-text-muted italic">No assets added yet</p>
          )}
        </div>
      </div>
      )}

      {activeTab === "telegram" && (
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Telegram Inline Buttons</h2>
            <p className="text-sm text-text-muted mt-0.5">
              Limit the number of inline action buttons that appear on Telegram notifications from your protocol.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5 max-w-sm">
            <label className="text-sm font-medium text-text-secondary">
              Max Inline Buttons
            </label>
            <Input
              type="number"
              min={0}
              max={20}
              id="telegram-max-buttons"
              value={telegramButtonsValue}
              onChange={(e) => setTelegramButtonsValue(e.target.value)}
              placeholder="e.g., 3 (leave blank to use global default)"
              className="w-full"
            />
            <p className="text-xs text-text-muted">
              Leave blank to reset to the global platform default. Useful if recipients report cluttered messages.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4 border-t border-border">
            <Button
              variant="default"
              isLoading={telegramButtonsMutation.isPending}
              onClick={() =>
                telegramButtonsMutation.mutate(
                  telegramButtonsValue.trim() ? telegramButtonsValue.trim() : null
                )
              }
            >
              Save Limit
            </Button>
            {telegramButtonsMutation.isSuccess && (
              <span className="text-sm text-green flex items-center gap-1.5 animate-in fade-in duration-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === "retry" && (
      <RetryPolicyForm />
      )}

      {activeTab === "x" && (
      <div className="rounded-xl border border-border bg-card p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h3 className="text-sm font-semibold text-foreground">X Account</h3>
          <p className="text-xs text-text-muted mt-1">
            Connect your project&apos;s X account to verify protocol ownership and activate notifications.
            Herald only requests read-only access — we never post on your behalf.
          </p>
        </div>

        {xStatus?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card-2 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 flex items-center justify-center text-sm font-bold text-[#1d9bf0]">
                  𝕏
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    @{xStatus.xUsername}
                    {xStatus.xVerified && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                        ✓ Verified
                      </span>
                    )}
                  </p>
                  {xStatus.xConnectedAt && (
                    <p className="text-xs text-text-dim">
                      Connected {new Date(xStatus.xConnectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-teal bg-teal/10 border border-teal/20 rounded-full px-2.5 py-1">
                ✓ Active
              </span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              isLoading={xDisconnecting}
              onClick={async () => {
                setXDisconnecting(true);
                try {
                  await disconnectTwitter();
                  toast.success("X account disconnected. Protocol deactivated.");
                  refetchX();
                  queryClient.invalidateQueries({ queryKey: ["protocol"] });
                } catch (err: any) {
                  toast.error(err?.message ?? "Failed to disconnect X account.");
                } finally {
                  setXDisconnecting(false);
                }
              }}
            >
              Disconnect X Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card-2 p-4 space-y-2.5">
              {[
                { icon: "⚡", text: "Instant protocol activation — no manual review" },
                { icon: "✓", text: "Verified mark shown to your subscribers" },
                { icon: "🔒", text: "Read-only access — Herald never posts for you" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{icon}</span>
                  <span className="text-sm text-text-muted">{text}</span>
                </div>
              ))}
            </div>
            <Button
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white border-0"
              isLoading={xConnecting}
              onClick={async () => {
                setXConnecting(true);
                try {
                  const { authUrl } = await getTwitterAuthUrl();
                  window.location.href = authUrl;
                } catch (err: any) {
                  toast.error(err?.message ?? "Failed to start X connection.");
                  setXConnecting(false);
                }
              }}
            >
              Connect @YourProject on X
            </Button>
          </div>
        )}
      </div>
      )}

      {activeTab === "tour" && (
      <TourSettingsPanel />
      )}

      {activeTab === "danger" && (
      <div className="bg-linear-to-br from-red/10 to-transparent border border-red/30 rounded-xl p-8 shadow-[0_0_20px_rgba(255,0,0,0.05)] animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h3 className="text-red font-bold text-lg mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger Zone
        </h3>
        <p className="text-red/80 text-sm max-w-xl mb-6">
          Deleting your project will permanently drop all notification queues,
          revoke all active API keys, and terminate your webhook streams.
        </p>
        <Button onClick={() => setModalOpen(true)} variant="destructive">
          Delete Project...
        </Button>
      </div>
      )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete Project"
        className="border border-red/30"
        >
          <div className="flex flex-col items-center justify-center p-2 space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">Are you sure you want to delete this project?</h2>
            <p className="text-sm text-text-muted mt-1">This action cannot be undone</p>
            <Input type="text" placeholder="Enter project name" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full"/>
            <div className="mt-5 flex items-center justify-center gap-4">
              <Button onClick={() => setModalOpen(false)} variant="secondary">
                Cancel
              </Button>
              <Button disabled={!isValid || deactivateMutation.isPending} isLoading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate()} variant="destructive">
                Delete
              </Button>
            </div>
          </div>
      </Modal>
    </div>
  );
}
