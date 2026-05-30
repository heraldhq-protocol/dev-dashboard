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
import {
  getBotTokenStatus,
  saveBotToken,
  removeBotToken,
  getGroupChatId,
  saveGroupChatId,
  removeGroupChatId,
  getThreadIds,
  saveThreadIds,
} from "@/lib/api/telegram";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useTourControls } from "@/components/onboarding/TourInitializer";
import { SandboxLockedAction } from "@/components/shared/SandboxLockedAction";
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

  // ── Telegram bot token ────────────────────────────────────────────────────
  const [botTokenInput, setBotTokenInput] = useState("");
  const [showBotToken, setShowBotToken] = useState(false);

  const { data: botTokenStatus, refetch: refetchBotToken } = useQuery({
    queryKey: ["telegram", "bot-token"],
    queryFn: getBotTokenStatus,
    enabled: activeTab === "telegram",
  });

  const saveBotTokenMutation = useMutation({
    mutationFn: (token: string) => saveBotToken(token),
    onSuccess: (data) => {
      toast.success(`Bot token saved — @${data.username}`);
      setBotTokenInput("");
      refetchBotToken();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid bot token");
    },
  });

  const removeBotTokenMutation = useMutation({
    mutationFn: removeBotToken,
    onSuccess: () => {
      toast.success("Bot token removed");
      refetchBotToken();
    },
  });

  // ── Group chat ────────────────────────────────────────────────────────────
  const [groupChatInput, setGroupChatInput] = useState("");

  const { data: groupChatData, refetch: refetchGroupChat } = useQuery({
    queryKey: ["telegram", "group-chat"],
    queryFn: getGroupChatId,
    enabled: activeTab === "telegram",
  });

  const saveGroupChatMutation = useMutation({
    mutationFn: (id: string) => saveGroupChatId(id),
    onSuccess: () => {
      toast.success("Group chat ID saved");
      setGroupChatInput("");
      refetchGroupChat();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save group chat ID");
    },
  });

  const removeGroupChatMutation = useMutation({
    mutationFn: removeGroupChatId,
    onSuccess: () => {
      toast.success("Group chat ID removed");
      refetchGroupChat();
    },
  });

  // ── Thread IDs ────────────────────────────────────────────────────────────
  const THREAD_CATEGORIES = ["defi", "governance", "system", "marketing"];
  const [threadInputs, setThreadInputs] = useState<Record<string, string>>({
    defi: "", governance: "", system: "", marketing: "",
  });

  const { data: threadIdsData, refetch: refetchThreadIds } = useQuery({
    queryKey: ["telegram", "threads"],
    queryFn: getThreadIds,
    enabled: activeTab === "telegram",
    onSuccess: (data: { threads: Record<string, string> | null }) => {
      if (data?.threads) {
        setThreadInputs((prev) => ({ ...prev, ...data.threads }));
      }
    },
  } as any);

  const saveThreadIdsMutation = useMutation({
    mutationFn: () => {
      const nonEmpty = Object.fromEntries(
        Object.entries(threadInputs).filter(([, v]) => v.trim() !== "")
      );
      return saveThreadIds(nonEmpty);
    },
    onSuccess: () => {
      toast.success("Thread IDs saved");
      refetchThreadIds();
    },
    onError: () => toast.error("Failed to save thread IDs"),
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
            <SandboxLockedAction>
              <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </SandboxLockedAction>
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
            <SandboxLockedAction>
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
            </SandboxLockedAction>
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
            <SandboxLockedAction>
              <Button type="submit" variant="default" isLoading={sandboxMutation.isPending}>
                Save Sandbox Contacts
              </Button>
            </SandboxLockedAction>
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
          <SandboxLockedAction>
            <Button type="submit" variant="default" isLoading={createAssetMutation.isPending} disabled={!newAssetUrl}>
              Add
            </Button>
          </SandboxLockedAction>
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
              <SandboxLockedAction>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAssetMutation.mutate(asset.id)}
                  className="text-red hover:text-red"
                >
                  Remove
                </Button>
              </SandboxLockedAction>
            </div>
          ))}
          {(!assets || assets.length === 0) && (
            <p className="text-sm text-text-muted italic">No assets added yet</p>
          )}
        </div>
      </div>
      )}

      {activeTab === "telegram" && (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* ── Tier gate — full tab ──────────────────────────────────────────── */}
        {(profile?.tier ?? 0) < 1 ? (
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card p-10 flex flex-col items-center text-center gap-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-bold text-foreground">Telegram delivery is a paid feature</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Send Telegram notifications to your subscribers, use a custom branded bot, set up group chat broadcasts, and track delivery rates. Available on Growth and above.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
              {[
                { icon: "🤖", label: "Custom bot token", desc: "Brand your notifications with your own bot" },
                { icon: "📢", label: "Group broadcasts", desc: "Send to a Telegram group or channel" },
                { icon: "📊", label: "Delivery analytics", desc: "Track sent, delivered, and click rates" },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="rounded-xl bg-card-2 border border-border p-3.5 space-y-1">
                  <div className="text-lg">{icon}</div>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-text-muted leading-snug">{desc}</p>
                </div>
              ))}
            </div>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors"
            >
              Upgrade to Growth
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <p className="text-[11px] text-text-muted">Starting at $99/mo · Cancel anytime</p>
          </div>
        ) : (<>

        {/* ── Custom Bot Token ─────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-6">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Custom Bot Token</h2>
              <p className="text-sm text-text-muted mt-0.5">
                Use your own Telegram bot for branded delivery. Messages will come from your bot instead of @useheraldbot.
              </p>
            </div>
            {botTokenStatus?.configured && (
              <span className="ml-auto shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal">
                Active
              </span>
            )}
          </div>

          {botTokenStatus?.configured ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card-2 border border-border">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">@{botTokenStatus.username}</p>
                  <p className="text-xs text-text-muted">Custom bot active</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-red-400 hover:text-red-300 text-sm"
                isLoading={removeBotTokenMutation.isPending}
                onClick={() => removeBotTokenMutation.mutate()}
              >
                Remove Bot Token
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-md">
                <label className="text-sm font-medium text-text-secondary">Bot Token</label>
                <div className="relative">
                  <Input
                    type={showBotToken ? "text" : "password"}
                    value={botTokenInput}
                    onChange={(e) => setBotTokenInput(e.target.value)}
                    placeholder="1234567890:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                    className="w-full font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBotToken((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                  >
                    {showBotToken ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-text-muted">
                  Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@BotFather</a> and paste the token here. It will be validated and stored encrypted.
                </p>
              </div>
              <SandboxLockedAction>
                <Button
                  variant="default"
                  isLoading={saveBotTokenMutation.isPending}
                  disabled={!botTokenInput.trim()}
                  onClick={() => saveBotTokenMutation.mutate(botTokenInput.trim())}
                >
                  Save Bot Token
                </Button>
              </SandboxLockedAction>
            </div>
          )}
        </div>

        {/* ── Group Chat / Channel ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-6">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Group Chat / Channel</h2>
              <p className="text-sm text-text-muted mt-0.5">
                Broadcast every notification to a Telegram group or channel. The bot must be an admin in the group. Each notification is sent once regardless of subscriber count.
              </p>
            </div>
            {groupChatData?.groupChatId && (
              <span className="ml-auto shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                Configured
              </span>
            )}
          </div>

          {groupChatData?.groupChatId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card-2 border border-border">
                <code className="text-xs font-mono text-foreground">{groupChatData.groupChatId}</code>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 text-sm"
                  isLoading={removeGroupChatMutation.isPending}
                  onClick={() => removeGroupChatMutation.mutate()}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-sm">
                <label className="text-sm font-medium text-text-secondary">Chat ID</label>
                <Input
                  type="text"
                  value={groupChatInput}
                  onChange={(e) => setGroupChatInput(e.target.value)}
                  placeholder="-1001234567890"
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-text-muted">
                  Add @useheraldbot (or your custom bot) to the group as admin, then send a message and check the chat ID via <code className="bg-card-2 px-1 rounded">getUpdates</code>.
                </p>
              </div>
              <SandboxLockedAction>
                <Button
                  variant="default"
                  isLoading={saveGroupChatMutation.isPending}
                  disabled={!groupChatInput.trim()}
                  onClick={() => saveGroupChatMutation.mutate(groupChatInput.trim())}
                >
                  Save Group Chat ID
                </Button>
              </SandboxLockedAction>
            </div>
          )}
        </div>

        {/* ── Topic Thread Routing ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-6">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Topic Thread Routing</h2>
              <p className="text-sm text-text-muted mt-0.5">
                Route each notification category into a dedicated topic thread inside a Telegram forum supergroup. Requires a Group Chat ID above.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-md">
            {THREAD_CATEGORIES.map((cat) => {
              const emoji: Record<string, string> = {
                defi: "💰", governance: "🗳️", system: "⚙️", marketing: "📢",
              };
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-text-secondary shrink-0">
                    {emoji[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </span>
                  <Input
                    type="text"
                    value={threadInputs[cat] ?? ""}
                    onChange={(e) =>
                      setThreadInputs((prev) => ({ ...prev, [cat]: e.target.value }))
                    }
                    placeholder="Thread ID (optional)"
                    className="font-mono text-xs flex-1"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-5 flex items-center gap-4 border-t border-border mt-5">
            <SandboxLockedAction>
              <Button
                variant="default"
                isLoading={saveThreadIdsMutation.isPending}
                onClick={() => saveThreadIdsMutation.mutate()}
              >
                Save Thread IDs
              </Button>
            </SandboxLockedAction>
            {saveThreadIdsMutation.isSuccess && (
              <span className="text-sm text-green flex items-center gap-1.5 animate-in fade-in duration-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>

        {/* ── Inline Buttons Limit ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
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
              <SandboxLockedAction>
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
              </SandboxLockedAction>
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

        </>)}

      </div>
      )}

      {activeTab === "retry" && (
      <RetryPolicyForm />
      )}

      {activeTab === "x" && (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-border font-bold text-base text-foreground">
                𝕏
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">X Account</h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Connect your project&apos;s X account to self-verify and instantly activate your protocol.
                </p>
              </div>
            </div>
            {xStatus?.connected ? (
              <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal">
                Active
              </span>
            ) : (
              <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-border text-text-muted">
                Not connected
              </span>
            )}
          </div>
        </div>

        {xStatus?.connected ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card-2 border border-border">
              <div className="h-10 w-10 rounded-full bg-white/5 border border-border flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                𝕏
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">@{xStatus.xUsername}</p>
                  {xStatus.xVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {xStatus.xConnectedAt && (
                  <p className="text-xs text-text-dim mt-0.5">
                    Connected {new Date(xStatus.xConnectedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold text-teal bg-teal/10 border border-teal/20 rounded-full px-2.5 py-1 shrink-0">
                ✓ Active
              </span>
            </div>

            <div className="pt-1 border-t border-border flex items-center justify-between gap-4">
              <p className="text-xs text-text-dim">Disconnecting will deactivate your protocol until reconnected.</p>
              <SandboxLockedAction message="Disconnect your X account in Live mode.">
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
                  Disconnect
                </Button>
              </SandboxLockedAction>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  title: "Instant activation",
                  desc: "No manual review. Your protocol goes live the moment you connect.",
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  ),
                  color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  title: "Verified badge",
                  desc: "Subscribers see a verified mark if your X account is verified.",
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  color: "text-teal bg-teal/10 border-teal/20",
                  title: "Read-only access",
                  desc: "We only read your public profile. Herald never posts on your behalf.",
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="rounded-xl border border-border bg-card-2 p-4 space-y-2.5">
                  <div className={`h-7 w-7 rounded-lg border flex items-center justify-center ${color}`}>
                    {icon}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-1 border-t border-border flex items-center justify-between gap-4">
              <p className="text-xs text-text-dim">
                You&apos;ll be redirected to X to authorise. No posting permissions are requested.
              </p>
              <SandboxLockedAction message="Connect your X account in Live mode.">
              <Button
                className="shrink-0 bg-foreground hover:bg-foreground/90 text-background border-0 gap-2 font-semibold"
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
                {!xConnecting && <span className="font-bold text-sm">𝕏</span>}
                Verify with X
              </Button>
              </SandboxLockedAction>
            </div>
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
        <SandboxLockedAction message="Switch to Live mode to delete your project.">
          <Button onClick={() => setModalOpen(true)} variant="destructive">
            Delete Project...
          </Button>
        </SandboxLockedAction>
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
