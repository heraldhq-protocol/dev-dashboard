"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProtocol, updateProtocol, deactivateProtocol, getSandboxSettings, updateSandboxSettings } from "@/lib/api/protocol";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Project Settings
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Configure your protocol identity and sender preferences.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
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

      {/* ── Sandbox Test Contacts ────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
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

      <div className="bg-red/10 border border-red/30 rounded-xl p-6">
        <h3 className="text-red font-bold text-sm mb-2">Danger Zone</h3>
        <p className="text-red/80 text-xs max-w-xl mb-4">
          Deleting your project will permanently drop all notification queues,
          revoke all active API keys, and terminate your webhook streams.
        </p>
        <Button onClick={() => setModalOpen(true)} variant="destructive" size="sm">
          Delete Project...
        </Button>
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
