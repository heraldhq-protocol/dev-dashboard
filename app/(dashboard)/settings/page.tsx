"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { Modal } from "@/components/ui/Modal";


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProtocol, updateProtocol, deactivateProtocol } from "@/lib/api/protocol";

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
