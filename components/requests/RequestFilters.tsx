"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Search, X } from "lucide-react";
import type { RequestLogFilters } from "@/lib/api/requests";

interface Props {
  filters: RequestLogFilters;
  onChange: (f: RequestLogFilters) => void;
}

const STATUS_PRESETS = [
  { label: "All", value: undefined },
  { label: "2xx", value: 200 },
  { label: "4xx", value: 400 },
  { label: "5xx", value: 500 },
];

export function RequestFilters({ filters, onChange }: Props) {
  const [endpointInput, setEndpointInput] = useState(filters.endpoint ?? "");

  const setStatusFilter = (code?: number) => {
    onChange({ ...filters, statusCode: code, page: 1 });
  };

  const applyEndpoint = () => {
    onChange({ ...filters, endpoint: endpointInput || undefined, page: 1 });
  };

  const clearEndpoint = () => {
    setEndpointInput("");
    onChange({ ...filters, endpoint: undefined, page: 1 });
  };

  const toggleTestKey = () => {
    onChange({ ...filters, isTestKey: filters.isTestKey === undefined ? true : filters.isTestKey === true ? false : undefined, page: 1 });
  };

  const testKeyLabel = filters.isTestKey === true ? "Test Keys" : filters.isTestKey === false ? "Live Keys" : "All Keys";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status filter */}
      <div className="flex items-center gap-1 rounded-lg bg-card-2 border border-border p-1">
        {STATUS_PRESETS.map((p) => {
          const isActive = p.value === undefined
            ? filters.statusCode === undefined
            : filters.statusCode !== undefined && Math.floor(filters.statusCode / 100) === Math.floor(p.value / 100);
          return (
            <button
              key={String(p.value)}
              onClick={() => setStatusFilter(p.value)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                isActive ? "bg-card text-foreground" : "text-text-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Test key toggle */}
      <button
        onClick={toggleTestKey}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
          filters.isTestKey !== undefined
            ? "bg-gold/10 border-gold/30 text-gold"
            : "bg-card-2 border-border text-text-muted hover:text-foreground"
        }`}
      >
        {testKeyLabel}
      </button>

      {/* Endpoint search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <input
          value={endpointInput}
          onChange={(e) => setEndpointInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyEndpoint()}
          placeholder="Filter by endpoint…"
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-teal/50 transition-colors"
        />
        {endpointInput && (
          <button onClick={clearEndpoint} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
