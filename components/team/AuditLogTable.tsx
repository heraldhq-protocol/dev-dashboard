"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AuditLogItem } from "@/lib/api/team";

const ACTION_LABELS: Record<string, string> = {
  "post.api-keys": "Created API key",
  "delete.api-keys": "Revoked API key",
  "post.webhooks": "Created webhook",
  "patch.webhooks": "Updated webhook",
  "delete.webhooks": "Deleted webhook",
  "post.team": "Invited team member",
  "patch.team": "Updated team member",
  "delete.team": "Removed team member",
  "post.templates": "Created template",
  "patch.templates": "Updated template",
  "delete.templates": "Deleted template",
  "post.domains": "Added domain",
  "delete.domains": "Deleted domain",
  "patch.protocols": "Updated protocol settings",
  "post.protocols": "Registered protocol",
};

function humanAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/\./g, " ").replace(/-/g, " ");
}

function ActorCell({ item }: { item: AuditLogItem }) {
  const wallet = item.actor?.walletPubkey;
  const role = item.actorRole ?? item.actor?.role ?? "unknown";
  if (!item.actorId) return <span className="text-text-muted text-xs">System</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-mono text-foreground">
        {wallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : "●●●●"}
      </span>
      <span className="text-[10px] text-text-muted capitalize">{role.replace("_", " ")}</span>
    </div>
  );
}

function JsonDiff({ label, value }: { label: string; value: unknown }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <pre className="text-xs font-mono text-text-muted bg-card-2 rounded-lg p-3 overflow-x-auto max-h-32 whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function AuditRow({ item }: { item: AuditLogItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(item.oldValue || item.newValue);

  return (
    <>
      <button
        onClick={() => hasDetail && setExpanded((e) => !e)}
        className={`w-full grid grid-cols-[140px_1fr_100px_80px_32px] gap-3 px-4 py-3 text-left transition-colors
          ${hasDetail ? "hover:bg-card-2/40 cursor-pointer group" : "cursor-default"}
          border-b border-border/50`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </span>
          <span className="text-[10px] text-text-muted">
            {format(new Date(item.timestamp), "MMM d, HH:mm")}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-foreground">{humanAction(item.action)}</span>
        </div>
        <ActorCell item={item} />
        <div className="flex items-center">
          {item.resourceType ? (
            <span className="text-[10px] font-mono text-text-muted bg-card-2 px-1.5 py-0.5 rounded">
              {item.resourceType}
            </span>
          ) : (
            <span className="text-[10px] text-text-muted">—</span>
          )}
        </div>
        <div className="flex items-center justify-center">
          {hasDetail && expanded && <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
          {hasDetail && !expanded && <ChevronRight className="h-3.5 w-3.5 text-text-muted/0 group-hover:text-text-muted transition-colors" />}
        </div>
      </button>

      {expanded && hasDetail && (
        <div className="px-4 pb-4 border-b border-border/50 bg-card-2/20 space-y-3">
          <JsonDiff label="Before" value={item.oldValue} />
          <JsonDiff label="After" value={item.newValue} />
        </div>
      )}
    </>
  );
}

interface Props {
  items: AuditLogItem[];
  isLoading: boolean;
}

export function AuditLogTable({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-card-2/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-12 w-12 rounded-xl bg-card-2 border border-border flex items-center justify-center mb-4">
          <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">No audit events</p>
        <p className="text-xs text-text-muted mt-1">Actions performed by your team will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="hidden sm:grid grid-cols-[140px_1fr_100px_80px_32px] gap-3 px-4 py-2.5 bg-card-2/50 border-b border-border text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <span>Time</span>
        <span>Action</span>
        <span>Actor</span>
        <span>Resource</span>
        <span />
      </div>
      <div>
        {items.map((item) => <AuditRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}
