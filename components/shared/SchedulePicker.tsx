"use client";

import { cn } from "@/lib/utils";

export interface SchedulePickerValue {
  mode: "now" | "once" | "recurring";
  scheduledFor?: string; // ISO string
  cronExpr?: string;
  timezone?: string;
}

interface SchedulePickerProps {
  value: SchedulePickerValue;
  onChange: (value: SchedulePickerValue) => void;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "US/Eastern", label: "US / Eastern" },
  { value: "US/Pacific", label: "US / Pacific" },
  { value: "Europe/London", label: "Europe / London" },
  { value: "Asia/Singapore", label: "Asia / Singapore" },
  { value: "Asia/Tokyo", label: "Asia / Tokyo" },
];

const FREQUENCIES = [
  { value: "hourly", label: "Hourly", cron: "0 * * * *" },
  { value: "daily", label: "Daily (9 AM)", cron: "0 9 * * *" },
  { value: "weekly", label: "Weekly (Mon 9 AM)", cron: "0 9 * * 1" },
  { value: "monthly", label: "Monthly (1st, 9 AM)", cron: "0 9 1 * *" },
];

const MODES: { value: SchedulePickerValue["mode"]; label: string }[] = [
  { value: "now", label: "Send Now" },
  { value: "once", label: "Schedule for Later" },
  { value: "recurring", label: "Recurring" },
];

function formatNextRun(value: SchedulePickerValue): string | null {
  if (value.mode === "now") return null;
  if (value.mode === "once" && value.scheduledFor) {
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: value.timezone ?? "UTC",
      }).format(new Date(value.scheduledFor));
    } catch {
      return value.scheduledFor;
    }
  }
  if (value.mode === "recurring" && value.cronExpr) {
    const freq = FREQUENCIES.find((f) => f.cron === value.cronExpr);
    if (freq) return `${freq.label} (${value.timezone ?? "UTC"})`;
    return `${value.cronExpr} (${value.timezone ?? "UTC"})`;
  }
  return null;
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const nextRun = formatNextRun(value);

  return (
    <div className="space-y-3">
      {/* Mode selector */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange({ ...value, mode: mode.value })}
            className={cn(
              "flex-1 py-2 text-xs font-semibold transition-colors border-r last:border-r-0 border-border",
              value.mode === mode.value
                ? "bg-teal/10 text-teal"
                : "bg-card-2 text-text-muted hover:text-foreground"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Once: datetime-local + timezone */}
      {value.mode === "once" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Date & Time</label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
              value={
                value.scheduledFor
                  ? value.scheduledFor.slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onChange({
                  ...value,
                  scheduledFor: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Timezone</label>
            <select
              className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
              value={value.timezone ?? "UTC"}
              onChange={(e) => onChange({ ...value, timezone: e.target.value })}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Recurring: frequency + timezone */}
      {value.mode === "recurring" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Frequency</label>
            <select
              className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
              value={
                FREQUENCIES.find((f) => f.cron === value.cronExpr)?.value ?? "daily"
              }
              onChange={(e) => {
                const freq = FREQUENCIES.find((f) => f.value === e.target.value);
                if (freq) onChange({ ...value, cronExpr: freq.cron });
              }}
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Timezone</label>
            <select
              className="w-full rounded-lg border border-border bg-card-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
              value={value.timezone ?? "UTC"}
              onChange={(e) => onChange({ ...value, timezone: e.target.value })}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Next run preview */}
      {nextRun && (
        <p className="text-[11px] text-text-muted flex items-center gap-1.5">
          <svg className="h-3 w-3 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Next run: <span className="text-foreground font-medium">{nextRun}</span>
        </p>
      )}
    </div>
  );
}
