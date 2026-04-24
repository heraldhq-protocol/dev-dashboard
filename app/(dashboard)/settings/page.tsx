"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProtocol, updateProtocol, deactivateProtocol, getSandboxSettings, updateSandboxSettings, getProtocolAssets, createProtocolAsset, deleteProtocolAsset } from "@/lib/api/protocol";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "sandbox" | "assets" | "danger">("general");

  const { data: profile, isLoading } = useQuery({
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
  if (sandboxData && !sandboxForm.testEmail && sandboxData.testEmail) {
    setSandboxForm({
      testEmail: sandboxData.testEmail ?? "",
      testTelegramId: sandboxData.testTelegramId ?? "",
      testPhone: sandboxData.testPhone ?? "",
    });
  }

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
  if (profile && !formData.name && profile.name) {
    setFormData({
      name: profile.name || "",
      websiteUrl: profile.website || "",
      logoUrl: profile.logoUrl || "",
      fromName: profile.customFromName || "",
    });
  }

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

  if (isLoading || !profile) {
    return <div className="text-text-muted">Loading settings…</div>;
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
                value={profile?.protocolId || ""}
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
            <select
              value={newAssetType}
              onChange={(e) => setNewAssetType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm"
            >
              <option value="banner">Banner</option>
              <option value="video">Video</option>
              <option value="logo">Logo</option>
            </select>
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
