"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { WebhookList } from "@/components/webhooks/WebhookList";
import { WebhookDeliveryLog } from "@/components/webhooks/WebhookDeliveryLog";
import { WebhookSecretReveal } from "@/components/webhooks/WebhookSecretReveal";
import { PageHeader } from "@/components/shared/PageHeader";
import { Plus, Check } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listWebhooks, createWebhook, updateWebhook, deleteWebhook } from "@/lib/api/webhooks";

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  
  // Modals state
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [viewLogsId, setViewLogsId] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: listWebhooks,
  });

  const createMutation = useMutation({
    mutationFn: createWebhook,
    onSuccess: (data) => {
      setIsCreateOpen(false);
      setNewUrl("");
      setSelectedEvents([]);
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      
      toast.success("Webhook created successfully.");
      if (data.secret) {
        setNewSecret(data.secret);
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create webhook");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: any }) => updateWebhook(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: () => {
      toast.error("Failed to update webhook");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook deleted");
      setWebhookToDelete(null);
    },
  });

  const AVAILABLE_EVENTS = [
    "notification.sent",
    "notification.failed",
    "notification.bounced",
    "apikey.created",
    "apikey.revoked",
  ];

  const handleToggle = useCallback((id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, dto: { isActive: !currentStatus } });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    setWebhookToDelete(id);
  }, []);

  const confirmDelete = () => {
    if (webhookToDelete) {
      deleteMutation.mutate(webhookToDelete);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || selectedEvents.length === 0) return;

    createMutation.mutate({
      url: newUrl.trim(),
      events: selectedEvents,
    });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Webhooks" 
          description="Receive real-time HTTP callbacks when events occur on the Herald network." 
        />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card-2/50 border border-border rounded-xl h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Receive real-time HTTP callbacks when events occur on the Herald network."
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shrink-0 group"
          >
            <Plus className="h-4 w-4" />
            Add Endpoint
          </Button>
        }
      />

      <WebhookList
        webhooks={webhooks}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onViewLogs={setViewLogsId}
      />

      {/* Modals for Feature 2 */}
      <WebhookDeliveryLog 
        webhookId={viewLogsId} 
        onClose={() => setViewLogsId(null)} 
      />

      <WebhookSecretReveal 
        isOpen={!!newSecret} 
        onClose={() => setNewSecret(null)} 
        secret={newSecret || ""} 
      />

      {/* Create Webhook Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Webhook Endpoint"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-6 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Endpoint URL
            </label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks/herald"
              type="url"
              required
              autoFocus
              className="w-full font-mono text-sm mt-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Subscribe to Events
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_EVENTS.map((event) => {
                const isSelected = selectedEvents.includes(event);
                return (
                  <button
                    key={event}
                    type="button"
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-mono font-semibold transition-all text-left ${
                      isSelected
                        ? "bg-teal/10 border-teal/40 text-teal"
                        : "bg-card border-border text-text-muted hover:border-text-muted hover:bg-card-2"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 mr-1.5 inline-block text-teal" />}
                    {event}
                  </button>
                );
              })}
            </div>
            {selectedEvents.length === 0 && (
              <p className="text-xs text-gold mt-1">
                Select at least one event to subscribe to.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={!newUrl.trim() || selectedEvents.length === 0 || createMutation.isPending}
              isLoading={createMutation.isPending}
            >
              Create Webhook
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Webhook Modal */}
      <Modal
        isOpen={!!webhookToDelete}
        onClose={() => setWebhookToDelete(null)}
        title="Delete Webhook"
      >
        <div className="flex flex-col gap-6 mt-2">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete this webhook? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWebhookToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="bg-red hover:bg-red/90 text-white"
              disabled={deleteMutation.isPending}
              isLoading={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              Delete Webhook
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
