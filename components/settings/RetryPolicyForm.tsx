"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRetryPolicy, updateRetryPolicy, type RetryPolicy } from "@/lib/api/protocol";

const BACKOFF_OPTIONS: { value: RetryPolicy["retryBackoff"]; label: string; desc: string }[] = [
  { value: "exponential", label: "Exponential", desc: "1m → 5m → 15m (recommended)" },
  { value: "linear", label: "Linear", desc: "Equal intervals" },
];

export function RetryPolicyForm() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["retryPolicy"],
    queryFn: getRetryPolicy,
    staleTime: 300_000,
  });

  const [form, setForm] = useState<RetryPolicy>({
    retryMaxAttempts: 3,
    retryWindowHours: 6,
    retryBackoff: "exponential",
    criticalCategories: [],
    trackEngagement: false,
  });

  const [catInput, setCatInput] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
      setDirty(false);
    }
  }, [data]);

  const update = useMutation({
    mutationFn: updateRetryPolicy,
    onSuccess: (updated) => {
      qc.setQueryData(["retryPolicy"], updated);
      setDirty(false);
      toast.success("Retry policy saved.");
    },
    onError: () => toast.error("Failed to save retry policy."),
  });

  const set = <K extends keyof RetryPolicy>(key: K, value: RetryPolicy[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const addCategory = () => {
    const tag = catInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || form.criticalCategories.includes(tag)) return;
    set("criticalCategories", [...form.criticalCategories, tag]);
    setCatInput("");
  };

  const removeCategory = (cat: string) => {
    set("criticalCategories", form.criticalCategories.filter((c) => c !== cat));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-card-2/50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Retry &amp; Engagement</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Configure how Herald retries failed notifications and tracks engagement events.
          </p>
        </div>
      </div>

      {/* Max attempts */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          Max Retry Attempts
        </label>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 5].map((n) => (
            <button
              key={n}
              onClick={() => set("retryMaxAttempts", n)}
              className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${
                form.retryMaxAttempts === n
                  ? "bg-teal text-navy-2 border-teal"
                  : "border-border text-text-muted hover:text-foreground hover:border-border-2"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="text-xs text-text-muted">attempts before giving up</span>
        </div>
      </div>

      {/* Window hours */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          Retry Window
        </label>
        <div className="flex items-center gap-3">
          {[1, 3, 6, 12, 24].map((h) => (
            <button
              key={h}
              onClick={() => set("retryWindowHours", h)}
              className={`px-3 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                form.retryWindowHours === h
                  ? "bg-teal text-navy-2 border-teal"
                  : "border-border text-text-muted hover:text-foreground hover:border-border-2"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
        <p className="text-[11px] text-text-muted">
          Herald will not retry after this window expires.
        </p>
      </div>

      {/* Backoff strategy */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          Backoff Strategy
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {BACKOFF_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => set("retryBackoff", value)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                form.retryBackoff === value
                  ? "border-teal bg-teal/5"
                  : "border-border hover:border-border-2"
              }`}
            >
              <div
                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  form.retryBackoff === value ? "border-teal" : "border-border"
                }`}
              >
                {form.retryBackoff === value && (
                  <div className="h-2 w-2 rounded-full bg-teal" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Critical categories */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          Critical Categories
        </label>
        <p className="text-[11px] text-text-muted">
          Notifications in these categories always use the maximum retry attempts, regardless of other settings.
        </p>
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {form.criticalCategories.map((cat) => (
            <span
              key={cat}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-card-2 border border-border text-text-muted"
            >
              {cat}
              <button
                onClick={() => removeCategory(cat)}
                className="ml-0.5 text-text-muted hover:text-red transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
            placeholder="e.g. liquidation"
            className="flex-1 px-3 py-1.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-teal/50 transition-colors"
          />
          <button
            onClick={addCategory}
            disabled={!catInput.trim()}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-card-2 border border-border text-text-muted hover:text-foreground transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      {/* Track engagement toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-navy-2 p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Enable Engagement Tracking</p>
          <p className="text-xs text-text-muted mt-0.5">
            Embed open pixels and link wrappers in email notifications to measure opens and clicks.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={form.trackEngagement}
          onClick={() => set("trackEngagement", !form.trackEngagement)}
          className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
            form.trackEngagement ? "bg-teal" : "bg-card-2 border border-border"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              form.trackEngagement ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        {dirty && (
          <p className="text-xs text-text-muted">You have unsaved changes.</p>
        )}
        <button
          onClick={() => update.mutate(form)}
          disabled={!dirty || update.isPending}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-teal text-navy-2 hover:bg-teal-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {update.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
