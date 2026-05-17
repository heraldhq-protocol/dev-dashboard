"use client";

import { useState } from "react";
import { Search, X, Download } from "lucide-react";
import type { AuditLogFilters } from "@/lib/api/team";

interface Props {
  filters: AuditLogFilters;
  onChange: (f: AuditLogFilters) => void;
  onExport: () => void;
  isExporting: boolean;
}

const RESOURCE_TYPES = ["api-keys", "webhooks", "team", "templates", "domains", "protocols"];

export function AuditLogFilters({ filters, onChange, onExport, isExporting }: Props) {
  const [actionInput, setActionInput] = useState(filters.action ?? "");

  const applyAction = () => onChange({ ...filters, action: actionInput || undefined, page: 1 });
  const clearAction = () => { setActionInput(""); onChange({ ...filters, action: undefined, page: 1 }); };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Resource type filter */}
      <div className="flex items-center gap-1 rounded-lg bg-card-2 border border-border p-1">
        <button
          onClick={() => onChange({ ...filters, resourceType: undefined, page: 1 })}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
            !filters.resourceType ? "bg-card text-foreground" : "text-text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {RESOURCE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => onChange({ ...filters, resourceType: t, page: 1 })}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
              filters.resourceType === t ? "bg-card text-foreground" : "text-text-muted hover:text-foreground"
            }`}
          >
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Date range */}
      <input
        type="date"
        value={filters.startDate?.slice(0, 10) ?? ""}
        onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined, page: 1 })}
        className="h-8 px-2 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-teal/50"
      />
      <span className="text-xs text-text-muted">→</span>
      <input
        type="date"
        value={filters.endDate?.slice(0, 10) ?? ""}
        onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined, page: 1 })}
        className="h-8 px-2 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-teal/50"
      />

      {/* Action search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <input
          value={actionInput}
          onChange={(e) => setActionInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyAction()}
          placeholder="Filter by action…"
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-teal/50 transition-colors"
        />
        {actionInput && (
          <button onClick={clearAction} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Export */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card-2 text-text-muted hover:text-foreground transition-colors disabled:opacity-40"
      >
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </button>
    </div>
  );
}
