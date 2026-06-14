"use client";

import { useComposerStore } from "@/hooks/use-composer-store";
import { usePlaygroundKey } from "@/hooks/use-playground-key";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChannelToggle } from "@/components/playground/channel-toggle";
import { ComposerEditor } from "@/components/playground/composer-editor";
import { ComposerPreview } from "@/components/playground/composer-preview";
import { Button } from "@/components/ui/Button";
import { Save, Send, RotateCcw, CheckCircle2, AlertCircle, Zap, Loader2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { testSend, sandboxSend, getNotificationStatus } from "@/lib/api/notifications";
import { stripMentionSpans } from "@/lib/email-renderer";
import type { NotificationStatus } from "@/lib/api/notifications";
import { getSandboxSettings } from "@/lib/api/protocol";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";


type SendMode = "test-contacts" | "manual-address";

const STATUS_CONFIG: Record<
  NotificationStatus["status"],
  { label: string; icon: React.ReactNode; className: string }
> = {
  queued: {
    label: "Queued — waiting for worker…",
    icon: <Clock className="w-3.5 h-3.5 shrink-0" />,
    className: "border-border bg-card text-text-muted",
  },
  processing: {
    label: "Processing — encrypting & dispatching…",
    icon: <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />,
    className: "border-border bg-card text-text-muted",
  },
  delivered: {
    label: "Delivered successfully!",
    icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-teal" />,
    className: "border-teal/30 bg-teal/5 text-teal",
  },
  partial: {
    label: "Partially delivered (some channels failed)",
    icon: <AlertCircle className="w-3.5 h-3.5 shrink-0 text-yellow-400" />,
    className: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  },
  failed: {
    label: "Delivery failed",
    icon: <XCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />,
    className: "border-red-500/30 bg-red-500/5 text-red-400",
  },
  opted_out: {
    label: "Recipient has opted out of notifications",
    icon: <AlertCircle className="w-3.5 h-3.5 shrink-0 text-text-muted" />,
    className: "border-border bg-card text-text-muted",
  },
  digested: {
    label: "Queued in digest — will send in next batch",
    icon: <Clock className="w-3.5 h-3.5 shrink-0 text-text-muted" />,
    className: "border-border bg-card text-text-muted",
  },
};

function DeliveryStatusBanner({
  status,
  onDismiss,
}: {
  status: NotificationStatus;
  onDismiss: () => void;
}) {
  const config = STATUS_CONFIG[status.status];
  const isTerminal = ["delivered", "failed", "partial", "opted_out", "digested"].includes(
    status.status,
  );
  return (
    <div
      className={`mt-3 flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs ${config.className}`}
    >
      {!isTerminal ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : config.icon}
      <span className="flex-1">{config.label}</span>
      {isTerminal && (
        <button
          onClick={onDismiss}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}***${phone.slice(-4)}`;
}

export default function ComposersPlaygroundPage() {
  const store = useComposerStore();
  const { activeKey, keyPrefix, isNewKey, handleClearKey } = usePlaygroundKey();

  const [testSendOpen, setTestSendOpen] = useState(false);
  const [sendMode, setSendMode] = useState<SendMode>("test-contacts");
  const [recipient, setRecipient] = useState("");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [deliveryStatus, setDeliveryStatus] = useState<NotificationStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (notificationId: string) => {
      stopPolling();
      let attempts = 0;
      const maxAttempts = 15; // 30s total
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const status = await getNotificationStatus(notificationId, activeKey);
          setDeliveryStatus(status);
          const terminal = ["delivered", "failed", "partial", "opted_out", "digested"];
          if (terminal.includes(status.status) || attempts >= maxAttempts) {
            stopPolling();
          }
        } catch {
          if (attempts >= maxAttempts) stopPolling();
        }
      }, 2000);
    },
    [activeKey, stopPolling],
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  const hasValidKey = activeKey.startsWith("hrld_test_");

  const { data: sandboxSettings } = useQuery({
    queryKey: ["sandbox-settings"],
    queryFn: getSandboxSettings,
    enabled: testSendOpen,
    staleTime: 30000,
  });

  const hasTestContacts =
    !!sandboxSettings?.testEmail ||
    !!sandboxSettings?.testTelegramId ||
    !!sandboxSettings?.testPhone;

  // One-time toast when a brand-new key is auto-created on first visit
  const newKeyToasted = useRef(false);
  useEffect(() => {
    if (isNewKey && !newKeyToasted.current) {
      newKeyToasted.current = true;
      toast.success("Sandbox key created and saved to this browser.", {
        description: "You won't need to enter it again on this device.",
        duration: 6000,
      });
    }
  }, [isNewKey]);

  const rawContent =
    store.activeChannel === "email"
      ? store.emailContent
      : store.activeChannel === "telegram"
        ? store.telegramContent
        : store.smsContent;

  const interpolate = (text: string) =>
    stripMentionSpans(text).replace(/{{\s*([^}]+?)\s*}}/g, (match, key) => store.testData[key.trim()] ?? match);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!hasValidKey) throw new Error("No sandbox key available.");

      const body = interpolate(rawContent);
      const subject = interpolate(store.emailSubject);

      if (sendMode === "test-contacts") {
        return sandboxSend(
          {
            subject,
            body,
            category: "system",
            preferred_channel: store.activeChannel,
          },
          activeKey,
        );
      }

      // manual-address mode (existing behavior)
      if (!recipient) throw new Error("Recipient is required.");

      return testSend(
        {
          walletAddress: recipient,
          subject,
          body,
          category: "system",
          previewOnly: false,
        },
        activeKey,
        store.activeChannel,
      );
    },
    onSuccess: (result: any) => {
      setDeliveryStatus(null);
      const notificationId = result?.notification_id ?? result?.id;
      if (notificationId && activeKey) {
        startPolling(notificationId);
      }

      if (sendMode === "test-contacts") {
        const contacts = result?.test_contact ?? {};
        const remaining = result?.remaining_today ?? "?";
        const parts: string[] = [];
        if (contacts.email) parts.push(`email: ${contacts.email}`);
        if (contacts.telegram) parts.push("Telegram: configured");
        if (contacts.sms) parts.push(`SMS: ${contacts.sms}`);
        toast.success(`Test sent — checking delivery…`, {
          description: parts.length
            ? `${parts.join(" · ")} · ${remaining} sends remaining today`
            : `${remaining} sends remaining today`,
          duration: 4000,
        });
      } else {
        toast.success(`Test queued — checking delivery…`);
      }
      setTestSendOpen(false);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send notification";
      if (err?.statusCode === 401 || err?.response?.status === 401) {
        toast.error("API key rejected — it may have been revoked.", {
          action: { label: "Clear & re-enter", onClick: handleClearKey },
        });
      } else if (err?.statusCode === 403) {
        toast.error("Sandbox endpoint requires a sandbox (hrld_test_) API key.");
      } else {
        toast.error(message);
      }
    },
  });

  return (
    <div className="flex flex-col h-full min-h-[600px] lg:h-[calc(100vh-8rem)]">
      <PageHeader
        title="Composers Playground"
        description="Draft and preview multi-channel notifications in real-time."
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                store.resetDraft(store.activeChannel);
                toast.success(`${store.activeChannel} draft reset`);
              }}
              data-adtivity-button-track="Playground Reset"
              className="gap-2 bg-white/5 border-white/5 hover:bg-white/10 rounded-full px-3 sm:px-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success("Draft saved locally")}
              data-adtivity-button-track="Playground Save Draft"
              className="gap-2 bg-white/5 border-white/5 hover:bg-white/10 rounded-full px-3 sm:px-4"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              id="playground-send-btn"
              variant="default"
              size="sm"
              onClick={() => setTestSendOpen(true)}
              data-adtivity-button-track="Playground Send Test Trigger"
              className="gap-2 rounded-full px-4 sm:px-5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test</span>
            </Button>
          </div>
        }
      />

{/* ── Delivery Status Banner ── */}
      {deliveryStatus && (
        <DeliveryStatusBanner
          status={deliveryStatus}
          onDismiss={() => { stopPolling(); setDeliveryStatus(null); }}
        />
      )}
      {sendMutation.isPending && !deliveryStatus && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs text-text-muted">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          Sending…
        </div>
      )}

      {/* ── Composer — full height, no key UI above it ── */}
      <div
        id="playground-composer"
        className="flex-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col min-h-0 mt-4"
      >
        <div
          id="playground-channel-toggle"
          className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-card"
        >
          <ChannelToggle />
          {/* Mobile view switcher */}
          <div className="flex sm:hidden w-full border-t border-border p-1.5 bg-card-2/30">
            <button
              onClick={() => setMobileView("edit")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                mobileView === "edit"
                  ? "bg-primary text-navy shadow-[0_2px_10px_rgba(0,200,150,0.3)]"
                  : "text-text-muted"
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                mobileView === "preview"
                  ? "bg-primary text-navy shadow-[0_2px_10px_rgba(0,200,150,0.3)]"
                  : "text-text-muted"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {/* Mobile */}
          <div className="sm:hidden h-full overflow-y-auto">
            {mobileView === "edit" ? (
              <div className="h-full">
                <ComposerEditor />
              </div>
            ) : (
              <div className="h-full p-4 bg-navy-2/20">
                <ComposerPreview />
              </div>
            )}
          </div>
          {/* Desktop */}
          <div className="hidden sm:block h-full">
            <ResizablePanelGroup orientation="horizontal" className="h-full">
              <ResizablePanel
                defaultSize={45}
                minSize={30}
                className="flex flex-col"
              >
                <ComposerEditor />
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className="bg-border border-x border-border hover:bg-primary/20 transition-colors"
              />
              <ResizablePanel defaultSize={55} minSize={30}>
                <ComposerPreview />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>

      {/* ── Send Test Dialog ── */}
      <Dialog open={testSendOpen} onOpenChange={setTestSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Notification</DialogTitle>
            <DialogDescription>
{sendMode === "test-contacts"
                ? "Deliver to your configured test contacts — no recipient address needed."
                : `Send a test ${store.activeChannel} to verify delivery. Variables will be replaced with your Test Data.`}
            </DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex items-center gap-3 py-2">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Send mode
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSendMode("test-contacts")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  sendMode === "test-contacts"
                    ? "bg-primary text-navy shadow-sm"
                    : "bg-card-2/50 text-text-muted hover:bg-card-2"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Test Contacts
              </button>
              <button
                type="button"
                onClick={() => setSendMode("manual-address")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  sendMode === "manual-address"
                    ? "bg-primary text-navy shadow-sm"
                    : "bg-card-2/50 text-text-muted hover:bg-card-2"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Manual Address
              </button>
            </div>
          </div>

          <div className="py-2 space-y-4">
            {/* Sandbox key indicator */}
            <div
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs ${
                hasValidKey
                  ? "border-primary/25 bg-primary/5 text-primary"
                  : "border-orange-500/30 bg-orange-500/5 text-orange-400"
              }`}
            >
              {hasValidKey ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {hasValidKey
                  ? `Sandbox mode — using key ${keyPrefix ?? activeKey.slice(0, 16)}…`
                  : "Sandbox key not ready yet — wait a moment and try again."}
              </span>
            </div>

            {/* Test Contacts mode — show configured contacts */}
            {sendMode === "test-contacts" && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border bg-card-2/30">
                  <div className="text-xs font-medium text-text-muted mb-2">
                    Your test contacts (from Settings)
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted w-16 text-xs">Email:</span>
                      <span>
                        {sandboxSettings?.testEmail
                          ? maskEmail(sandboxSettings.testEmail)
                          : <span className="text-orange-400">Not set</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted w-16 text-xs">Telegram:</span>
                      <span>
                        {sandboxSettings?.testTelegramId
                          ? "configured"
                          : <span className="text-orange-400">Not set</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted w-16 text-xs">SMS:</span>
                      <span>
                        {sandboxSettings?.testPhone
                          ? maskPhone(sandboxSettings.testPhone)
                          : <span className="text-orange-400">Not set</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Address mode — recipient input */}
            {sendMode === "manual-address" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Recipient ({store.activeChannel})
                </label>
                <Input
                  placeholder={
                    store.activeChannel === "email"
                      ? "test@example.com"
                      : store.activeChannel === "telegram"
                        ? "@username or ID"
                        : "+1234567890"
                  }
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestSendOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={
                (sendMode === "manual-address" && !recipient) ||
                !hasValidKey ||
                sendMutation.isPending ||
                (sendMode === "test-contacts" && !hasTestContacts)
              }
              isLoading={sendMutation.isPending}
              data-adtivity-button-track="Playground Send Test Confirm"
            >
              {sendMode === "test-contacts" ? "Send to Test Contacts" : "Send Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
