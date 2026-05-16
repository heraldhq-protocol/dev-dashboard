"use client";

import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { RequestLogItem } from "@/lib/api/requests";
import { formatDistanceToNow } from "date-fns";

function JsonBlock({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value ?? null, null, 2);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative rounded-lg bg-card-2 border border-border overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-2 right-2 h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-foreground hover:bg-secondary transition-colors z-10"
      >
        {copied ? <Check className="h-3 w-3 text-teal" /> : <Copy className="h-3 w-3" />}
      </button>
      <pre className="text-xs font-mono text-text-muted leading-relaxed p-4 overflow-x-auto whitespace-pre-wrap max-h-[260px] overflow-y-auto">
        {text}
      </pre>
    </div>
  );
}

function StatusBadge({ code }: { code: number }) {
  const color = code < 300 ? "text-status-success bg-status-success/10 border-status-success/20"
    : code < 500 ? "text-gold bg-gold/10 border-gold/20"
    : "text-red bg-red/10 border-red/20";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
      {code}
    </span>
  );
}

interface Props {
  log: RequestLogItem | null;
  onClose: () => void;
}

export function RequestDetailDrawer({ log, onClose }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm transition-opacity duration-300 ${log ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] flex flex-col bg-navy-2 border-l border-border shadow-2xl transition-transform duration-300 ${log ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {log && (
              <>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  log.method === "POST" ? "text-teal bg-teal/10 border-teal/20" : "text-text-muted bg-card-2 border-border"
                }`}>{log.method}</span>
                <code className="text-xs text-foreground font-mono">{log.endpoint}</code>
              </>
            )}
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-md text-text-muted hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {log && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <StatusBadge code={log.statusCode} />
              <span className="text-text-muted">{log.latencyMs}ms</span>
              {log.isTestKey && (
                <span className="text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                  Test Key
                </span>
              )}
              <span className="text-text-muted ml-auto">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>

            {log.correlationId && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted uppercase tracking-wide">Correlation ID</span>
                <code className="text-xs font-mono text-text-muted">{log.correlationId}</code>
              </div>
            )}

            {/* Request body */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-2">Request Body</h3>
              <JsonBlock value={log.requestBody} />
            </div>

            {/* Response body */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-2">Response Body</h3>
              <JsonBlock value={log.responseBody} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
