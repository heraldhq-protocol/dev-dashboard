"use client";

import { useComposerStore } from "@/hooks/use-composer-store";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChannelToggle } from "@/components/playground/channel-toggle";
import { ComposerEditor } from "@/components/playground/composer-editor";
import { ComposerPreview } from "@/components/playground/composer-preview";
import { Button } from "@/components/ui/Button";
import { Save, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";
// We import and mock the send action just for demonstration in the new UI.
import { testSend, getPlaygroundApiKey } from "@/lib/api/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  const [testSendOpen, setTestSendOpen] = useState(false);
  const [recipient, setRecipient] = useState("");

  const { data: apiKeyData } = useQuery({
    queryKey: ["playground-api-key"],
    queryFn: getPlaygroundApiKey,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!apiKeyData?.key) throw new Error("No API key available");
      if (!recipient) throw new Error("Recipient required");
      
      const content = 
        store.activeChannel === "email" ? store.emailContent :
        store.activeChannel === "telegram" ? store.telegramContent :
        store.smsContent;

      return testSend(
        { 
          walletAddress: recipient, 
          subject: store.emailSubject,
          body: content, 
          category: "system",
          previewOnly: false 
        },
        apiKeyData.key,
        store.activeChannel
      );
    },
    onSuccess: () => {
      toast.success(`Test notification sent via ${store.activeChannel}!`);
      setTestSendOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send notification");
    },
  });

  const handleSaveDraft = () => {
    // We already persist locally via Zustand. We could sync to API here.
    toast.success("Draft saved locally");
  };

  const handleReset = () => {
    store.resetDraft(store.activeChannel);
    toast.success(`${store.activeChannel} draft reset`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Composers Playground"
        description="Draft and preview multi-channel notifications in real-time."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="gap-2 bg-white/5 border-white/5 hover:bg-white/10 rounded-full px-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              className="gap-2 bg-white/5 border-white/5 hover:bg-white/10 rounded-full px-4"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setTestSendOpen(true)}
              className="gap-2 rounded-full px-5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col min-h-0 mt-4">
        <ChannelToggle />
        
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize={45} minSize={30} className="flex flex-col">
              <ComposerEditor />
            </ResizablePanel>
            
            <ResizableHandle withHandle className="bg-border border-x border-border hover:bg-primary/20 transition-colors" />
            
            <ResizablePanel defaultSize={55} minSize={30}>
              <ComposerPreview />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <Dialog open={testSendOpen} onOpenChange={setTestSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Notification</DialogTitle>
            <DialogDescription>
              Send a test {store.activeChannel} to verify delivery. Variables will be replaced with your Test Data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient ({store.activeChannel})</label>
              <Input
                placeholder={
                  store.activeChannel === "email" ? "test@example.com" :
                  store.activeChannel === "telegram" ? "@username or ID" :
                  "+1234567890"
                }
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestSendOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => sendMutation.mutate()} 
              disabled={!recipient || sendMutation.isPending}
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