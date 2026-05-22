"use client";

import Link from "next/link";
import { CheckCircle2, Circle, X, ChevronRight } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { Button } from "@/components/ui/Button";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  /** If present, rendered as a Link. If absent, action is "Mark done" button. */
  href?: string;
  /** Label for the CTA */
  cta: string;
  /** Called when the user clicks "Mark done" (manual items only) */
  onMarkDone?: () => void;
}

interface OnboardingChecklistProps {
  /** Auto-detected from API — no store state needed */
  hasApiKey: boolean;
  hasWebhook: boolean;
  hasSentNotification: boolean;
}

export function OnboardingChecklist({
  hasApiKey,
  hasWebhook,
  hasSentNotification,
}: OnboardingChecklistProps) {
  const { checklist, setChecklistItem, dismissChecklist } = useOnboardingStore();

  if (checklist.checklistDismissed) return null;

  const items: ChecklistItem[] = [
    {
      id: "api-key",
      label: "Create an API key",
      description: "Generate a test or live key to authenticate SDK calls.",
      done: hasApiKey,
      href: "/api-keys",
      cta: "Go to API Keys",
    },
    {
      id: "webhook",
      label: "Register a webhook endpoint",
      description: "Receive real-time delivery events to your server.",
      done: hasWebhook,
      href: "/webhooks",
      cta: "Set up webhook",
    },
    {
      id: "notification",
      label: "Send your first notification",
      description: "Dispatch a test event through the SDK or Playground.",
      done: hasSentNotification,
      href: "/playground",
      cta: "Open Playground",
    },
    {
      id: "playground",
      label: "Explore the Playground",
      description: "Interactively craft and preview notification payloads.",
      done: checklist.playgroundUsed,
      href: "/playground",
      cta: checklist.playgroundUsed ? "Done" : "Open Playground",
      onMarkDone: () => setChecklistItem("playgroundUsed", true),
    },
    {
      id: "docs",
      label: "Read the integration docs",
      description: "Understand payload format, HMAC signing, and best practices.",
      done: checklist.docsRead,
      cta: checklist.docsRead ? "Done" : "Mark done",
      onMarkDone: () => setChecklistItem("docsRead", true),
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-foreground">Get started with Herald</h2>
            <span className="text-xs text-text-muted font-medium bg-card-2 border border-border rounded-full px-2 py-0.5">
              {completedCount}/{items.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-card-2 rounded-full h-1.5 mt-2">
            <div
              className="bg-teal rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <button
          onClick={dismissChecklist}
          className="ml-4 text-text-muted hover:text-foreground transition-colors p-1 rounded"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Items */}
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${item.done ? "opacity-60" : "hover:bg-card-2/50"}`}
          >
            {/* Status icon */}
            <div className="shrink-0">
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-teal" />
              ) : (
                <Circle className="w-5 h-5 text-border" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.done ? "line-through text-text-muted" : "text-foreground"}`}>
                {item.label}
              </p>
              {!item.done && (
                <p className="text-xs text-text-muted mt-0.5 truncate">{item.description}</p>
              )}
            </div>

            {/* CTA */}
            {!item.done && (
              item.href && !item.onMarkDone ? (
                <Link
                  href={item.href}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                >
                  {item.cta}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              ) : item.onMarkDone ? (
                <div className="shrink-0 flex items-center gap-2">
                  {item.href && (
                    <Link
                      href={item.href}
                      className="text-xs font-semibold text-teal hover:underline flex items-center gap-1"
                    >
                      Open
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={item.onMarkDone}
                  >
                    Mark done
                  </Button>
                </div>
              ) : null
            )}
          </li>
        ))}
      </ul>

      {/* Footer — all done */}
      {allDone && (
        <div className="px-5 py-4 border-t border-border bg-status-success-bg flex items-center justify-between gap-4">
          <p className="text-sm text-[#10b981] font-medium">
            You&apos;re all set! Herald is fully integrated.
          </p>
          <Button variant="ghost" size="sm" className="text-xs text-text-muted" onClick={dismissChecklist}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
