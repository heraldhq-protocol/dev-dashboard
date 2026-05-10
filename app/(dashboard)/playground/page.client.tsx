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
import { Save, Send, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { testSend } from "@/lib/api/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";

export default function ComposersPlaygroundPage() {
  const store = useComposerStore();
  const { activeKey, keyPrefix, isNewKey, handleClearKey } = usePlaygroundKey();

  const [testSendOpen, setTestSendOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  const hasValidKey = activeKey.startsWith("hrld_test_");

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

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!hasValidKey) throw new Error("No sandbox key available.");
      if (!recipient) throw new Error("Recipient is required.");

      const content =
        store.activeChannel === "email"
          ? store.emailContent
          : store.activeChannel === "telegram"
            ? store.telegramContent
            : store.smsContent;

      return testSend(
        {
          walletAddress: recipient,
          subject: store.emailSubject,
          body: content,
          category: "system",
          previewOnly: false,
        },
        activeKey,
        store.activeChannel,
      );
    },
    onSuccess: () => {
      toast.success(`Test notification sent via ${store.activeChannel}!`);
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
              className="gap-2 bg-white/5 border-white/5 hover:bg-white/10 rounded-full px-3 sm:px-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success("Draft saved locally")}
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
              className="gap-2 rounded-full px-4 sm:px-5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test</span>
            </Button>
          </div>
        }
      />

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
              Send a test {store.activeChannel} to verify delivery. Variables
              will be replaced with your Test Data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
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
                  ? `Sandbox mode — routes to your test contacts only (${keyPrefix ?? activeKey.slice(0, 16)}…).`
                  : "Sandbox key not ready yet — wait a moment and try again."}
              </span>
            </div>
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestSendOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!recipient || !hasValidKey || sendMutation.isPending}
              isLoading={sendMutation.isPending}
            >
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
