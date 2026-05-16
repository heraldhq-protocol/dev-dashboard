"use client";

import { useUiStore } from "@/lib/stores/ui.store";
import {
  CHANGELOG_ENTRIES,
  getLatestDate,
  type ChangelogEntry,
  type ChangelogTag,
} from "@/lib/changelog";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const TAG_STYLES: Record<ChangelogTag, string> = {
  Feature: "bg-teal/10 text-teal border-teal/20",
  Improvement: "bg-purple/10 text-purple border-purple/20",
  Fix: "bg-gold/10 text-gold border-gold/20",
  Deprecation: "bg-red/10 text-red border-red/20",
};

function ChangelogEntryCard({
  entry,
  isUnread,
}: {
  entry: ChangelogEntry;
  isUnread: boolean;
}) {
  const formatted = new Date(entry.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-colors",
        isUnread
          ? "border-teal/20 bg-teal/5"
          : "border-border bg-card"
      )}
    >
      {/* Unread indicator */}
      {isUnread && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-teal" />
      )}

      {/* Header */}
      <div className="flex items-start gap-2 mb-2 pr-4">
        <span
          className={cn(
            "shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wide border rounded px-1.5 py-0.5",
            TAG_STYLES[entry.tag]
          )}
        >
          {entry.tag}
        </span>
        <span className="text-[10px] text-text-muted mt-0.5 shrink-0">
          {formatted}
        </span>
      </div>

      <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5">
        {entry.title}
      </h3>

      <p className="text-xs text-text-muted leading-relaxed">{entry.body}</p>

      {entry.learnMoreUrl && (
        <a
          href={entry.learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-teal hover:underline"
        >
          Learn more
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export function ChangelogDrawer() {
  const { isChangelogOpen, closeChangelog, lastReadChangelog, markChangelogRead } =
    useUiStore();

  if (!isChangelogOpen) return null;

  const latestDate = getLatestDate();

  const handleMarkRead = () => {
    markChangelogRead(latestDate);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeChangelog}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-navy border-l border-border shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">What&apos;s New</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Herald platform updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastReadChangelog !== latestDate && (
              <button
                onClick={handleMarkRead}
                className="text-xs text-teal hover:underline font-semibold"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={closeChangelog}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close changelog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {CHANGELOG_ENTRIES.map((entry) => {
            const isUnread =
              !lastReadChangelog || entry.date > lastReadChangelog;
            return (
              <ChangelogEntryCard
                key={entry.slug}
                entry={entry}
                isUnread={isUnread}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-5 py-3 text-center">
          <a
            href="https://useherald.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-teal transition-colors"
          >
            Full changelog & docs →
          </a>
        </div>
      </div>
    </>
  );
}
