"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmailComposer } from "@/components/playground/EmailComposer";
import { TelegramComposer } from "@/components/playground/TelegramComposer";
import { SmsComposer } from "@/components/playground/SmsComposer";
import { EmailPreview } from "@/components/playground/EmailPreview";
import { testSend, previewNotification, getPlaygroundApiKey, type PlaygroundApiKey } from "@/lib/api/notifications";
import { Button } from "@/components/ui/Button";
import { TestSendDto } from "@/types/api";
import { isAxiosError } from "axios";
import { PageHeader } from "@/components/shared/PageHeader";
import { RotateCcw } from "lucide-react";

type ChannelTab = "email" | "telegram" | "sms";

export default function PlaygroundPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ChannelTab>("email");
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"html" | "telegram" | "sms">("html");
  const [apiKey, setApiKey] = useState<PlaygroundApiKey | null>(null);

  const { data: keyData, isLoading: loadingKey, refetch: refetchKey } = useQuery({
    queryKey: ["playground-api-key"],
    queryFn: getPlaygroundApiKey,
  });

  if (keyData && !apiKey) {
    setApiKey(keyData);
  }

  const previewMutation = useMutation({
    mutationFn: (dto: TestSendDto) => {
      if (!apiKey?.key) {
        throw new Error("No API key available");
      }
      return previewNotification(dto, apiKey.key, activeTab as "email" | "telegram" | "sms");
    },
    onSuccess: (data) => {
      if (activeTab === "email" && data.renderedHtml) {
        setHtmlSnippet(data.renderedHtml);
      } else if (activeTab === "telegram" && data.telegramText) {
        setHtmlSnippet(data.telegramText);
      } else if (activeTab === "sms" && data.smsText) {
        setHtmlSnippet(data.smsText);
      }
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        toast.error(err?.response?.data?.message || "Failed to render preview");
      }
      if (err instanceof Error) {
        toast.error(err.message);
      }
    },
  });

  const sendMutation = useMutation({
    mutationFn: (dto: TestSendDto) => {
      if (!apiKey?.key) {
        throw new Error("No API key available");
      }
      return testSend({ ...dto, previewOnly: false }, apiKey.key, activeTab as "email" | "telegram" | "sms");
    },
    onSuccess: (data) => {
      toast.success(`Test notification sent via ${activeTab}!`);
      if (data.renderedHtml) {
        setHtmlSnippet(data.renderedHtml);
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send notification");
    },
  });

  const isLoading = previewMutation.isPending || sendMutation.isPending;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-8rem)] space-y-4">
      <PageHeader
        title="Notification Playground"
        description="Draft and preview notifications across channels."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-navy-2/60 backdrop-blur-md border border-white/5 rounded-full shadow-2xl">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Live API</span>
              {loadingKey ? (
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              ) : apiKey ? (
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-green shadow-[0_0_10px_#27AE60]" />
                  <span className="text-xs text-foreground font-mono font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">
                    {apiKey.keyPrefix}<span className="opacity-30">••••</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red shadow-[0_0_10px_#E74C3C]" />
                  <span className="text-[10px] text-red/80 font-bold uppercase">Missing</span>
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setHtmlSnippet(null);
                toast.success("Playground reset");
              }}
              className="gap-2 shrink-0 group hidden sm:flex bg-white/5 border-white/5 hover:bg-white/10 rounded-full px-4"
            >
              <RotateCcw className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-transform group-hover:-rotate-180 duration-700" />
              <span className="text-xs font-bold uppercase tracking-tighter">Reset</span>
            </Button>
          </div>
        }
      />

      {/* Channel Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto mb-2">
        {(["email", "telegram", "sms"] as ChannelTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab
                ? "text-primary border-primary"
                : "text-text-muted border-transparent hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Composer + Preview Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
        <div className="min-h-[400px] lg:min-h-0">
          {activeTab === "email" && (
            <EmailComposer
              onPreview={(dto) => previewMutation.mutate(dto)}
              onSend={(dto) => sendMutation.mutate(dto)}
              isLoading={isLoading}
            />
          )}
          {activeTab === "telegram" && (
            <TelegramComposer
              onPreview={(dto) => previewMutation.mutate(dto)}
              onSend={(dto) => sendMutation.mutate(dto)}
              isLoading={isLoading}
            />
          )}
          {activeTab === "sms" && (
            <SmsComposer
              onPreview={(dto) => previewMutation.mutate(dto)}
              onSend={(dto) => sendMutation.mutate(dto)}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col min-h-[400px] lg:min-h-0">
          <EmailPreview
            htmlSnippet={htmlSnippet}
            isLoading={previewMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}