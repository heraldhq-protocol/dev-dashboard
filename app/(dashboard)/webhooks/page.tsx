"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { WebhookList, Webhook } from "@/components/webhooks/WebhookList";

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "wh_1",
    url: "https://api.myprotocol.xyz/herald/events",
    events: [
      "notification.sent",
      "notification.failed",
      "notification.bounced",
    ],
    active: true,
    lastTriggeredAt: new Date(Date.now() - 300000).toISOString(),
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    failureCount: 0,
  },
  {
    id: "wh_2",
    url: "https://hooks.slack.com/services/T0x.../B0x.../abcdef",
    events: ["notification.failed"],
    active: true,
    lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 1728000000).toISOString(),
    failureCount: 2,
  },
  {
    id: "wh_3",
    url: "https://staging.myprotocol.xyz/webhooks/herald",
    events: ["notification.sent"],
    active: false,
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    failureCount: 0,
  },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const AVAILABLE_EVENTS = [
    "notification.sent",
    "notification.failed",
    "notification.bounced",
    "apikey.created",
    "apikey.revoked",
  ];

  const handleToggle = useCallback((id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, active: !wh.active } : wh)),
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || selectedEvents.length === 0) return;

    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url: newUrl.trim(),
      events: selectedEvents,
      active: true,
      createdAt: new Date().toISOString(),
      failureCount: 0,
    };

    setWebhooks((prev) => [webhook, ...prev]);
    setIsCreateOpen(false);
    setNewUrl("");
    setSelectedEvents([]);
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Webhooks
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Receive real-time HTTP callbacks when events occur on the Herald
            network.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 shrink-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Endpoint
        </Button>
      </div>

      <WebhookList
        webhooks={webhooks}
        onToggle={handleToggle}
        onDelete={handleDelete}
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
              className="w-full font-mono text-sm"
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
                    {isSelected && <span className="mr-1.5">✓</span>}
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
              variant="primary"
              disabled={!newUrl.trim() || selectedEvents.length === 0}
            >
              Create Webhook
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
