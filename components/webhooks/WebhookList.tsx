"use client";

import { Badge } from "@/components/ui/Badge";
import { WebhookTestButton } from "./WebhookTestButton";
import { formatDistanceToNow } from "date-fns";

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
  failureCount: number;
}

interface WebhookListProps {
  webhooks: Webhook[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WebhookList({ webhooks, onToggle, onDelete }: WebhookListProps) {
  if (webhooks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-16 text-center">
        <svg className="mx-auto h-12 w-12 text-text-muted/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h3 className="text-lg font-bold text-white mb-1">No webhooks configured</h3>
        <p className="text-sm text-text-muted max-w-sm mx-auto">
          Create a webhook endpoint to receive real-time notifications when events occur on your protocol.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {webhooks.map((wh) => (
        <div
          key={wh.id}
          className="bg-card border border-border rounded-xl p-5 hover:border-border-2 transition-colors group"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left: URL + event badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${wh.active ? "bg-green shadow-[0_0_8px_#27AE60]" : "bg-text-muted/40"}`} />
                <code className="text-sm font-mono text-white truncate block">{wh.url}</code>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3 ml-5">
                {wh.events.map((ev) => (
                  <Badge key={ev} variant="secondary" className="text-[10px]">
                    {ev}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-3 ml-5 text-xs text-text-muted">
                <span>
                  Last triggered:{" "}
                  {wh.lastTriggeredAt
                    ? formatDistanceToNow(new Date(wh.lastTriggeredAt), { addSuffix: true })
                    : "Never"}
                </span>
                {wh.failureCount > 0 && (
                  <span className="text-red font-semibold">{wh.failureCount} recent failures</span>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:shrink-0">
              <WebhookTestButton webhookId={wh.id} endpointUrl={wh.url} />

              <button
                onClick={() => onToggle(wh.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  wh.active
                    ? "bg-green/10 border-green/20 text-green hover:bg-green/20"
                    : "bg-card-2 border-border text-text-muted hover:text-white hover:border-text-muted"
                }`}
              >
                {wh.active ? "Enabled" : "Disabled"}
              </button>

              <button
                onClick={() => onDelete(wh.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-text-muted hover:text-red hover:border-red/20 hover:bg-red/10 transition-all opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
