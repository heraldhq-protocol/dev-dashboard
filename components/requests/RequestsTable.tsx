"use client";

import { formatDistanceToNow } from "date-fns";
import type { RequestLogItem } from "@/lib/api/requests";
import { ChevronRight } from "lucide-react";

function StatusBadge({ code }: { code: number }) {
  const color = code < 300
    ? "text-status-success bg-status-success/10"
    : code < 500
    ? "text-gold bg-gold/10"
    : "text-red bg-red/10";
  return (
    <span className={`inline-flex items-center justify-center w-12 text-xs font-bold rounded px-1.5 py-0.5 ${color}`}>
      {code}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const color = method === "POST" ? "text-teal bg-teal/10" : method === "GET" ? "text-blue-400 bg-blue-400/10" : "text-text-muted bg-card-2";
  return (
    <span className={`inline-flex w-12 items-center justify-center text-[10px] font-bold uppercase rounded px-1 py-0.5 ${color}`}>
      {method}
    </span>
  );
}

interface Props {
  items: RequestLogItem[];
  isLoading: boolean;
  onSelect: (item: RequestLogItem) => void;
}

export function RequestsTable({ items, isLoading, onSelect }: Props) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">No requests yet</p>
        <p className="text-xs text-text-muted mt-1">API request logs will appear here once you start sending notifications.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[48px_80px_1fr_80px_60px_100px_32px] gap-3 px-4 py-2.5 bg-card-2/50 border-b border-border text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <span>Status</span>
        <span>Method</span>
        <span>Endpoint</span>
        <span>Key</span>
        <span>Latency</span>
        <span>Time</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/50">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full grid grid-cols-1 sm:grid-cols-[48px_80px_1fr_80px_60px_100px_32px] gap-2 sm:gap-3 px-4 py-3 hover:bg-card-2/40 transition-colors text-left group"
          >
            <div className="flex sm:block items-center gap-2">
              <StatusBadge code={item.statusCode} />
              <MethodBadge method={item.method} />
              <code className="sm:hidden text-xs font-mono text-text-muted truncate flex-1">{item.endpoint}</code>
            </div>
            <div className="hidden sm:flex items-center">
              <MethodBadge method={item.method} />
            </div>
            <div className="hidden sm:flex items-center">
              <code className="text-xs font-mono text-text-muted truncate">{item.endpoint}</code>
            </div>
            <div className="hidden sm:flex items-center">
              {item.isTestKey ? (
                <span className="text-[10px] font-bold text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded">TEST</span>
              ) : (
                <span className="text-[10px] text-text-muted">LIVE</span>
              )}
            </div>
            <div className="hidden sm:flex items-center">
              <span className="text-xs text-text-muted">{item.latencyMs}ms</span>
            </div>
            <div className="hidden sm:flex items-center">
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="hidden sm:flex items-center justify-center">
              <ChevronRight className="h-3.5 w-3.5 text-text-muted/0 group-hover:text-text-muted transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
