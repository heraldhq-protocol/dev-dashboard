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
      <div className="mb-2 shrink-0">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
          Notification Playground
        </h1>
        <p className="text-xs lg:text-sm text-text-muted mt-1">
          Draft and preview notifications across channels.
        </p>
      </div>

      {/* API Key Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 bg-card-2 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">API Key:</span>
          {loadingKey ? (
            <span className="text-sm text-text-muted">Loading...</span>
          ) : apiKey ? (
            <span className="text-sm text-foreground font-mono">
              {apiKey.keyPrefix}... (auto)
            </span>
          ) : (
            <span className="text-sm text-text-muted">No key</span>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetchKey()}
          disabled={loadingKey}
        >
          Refresh
        </Button>
      </div>

      {/* Channel Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {(["email", "telegram", "sms"] as ChannelTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 lg:px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab
                ? "text-foreground border-primary"
                : "text-text-muted border-transparent hover:text-foreground"
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
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm overflow-hidden min-h-[400px] lg:min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm lg:text-base font-bold text-foreground">Preview</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setPreviewMode("html")}
                className={`px-2 py-1 text-xs rounded ${
                  previewMode === "html" ? "bg-primary text-foreground" : "text-text-muted"
                }`}
              >
                {activeTab === "email" ? "HTML" : "Text"}
              </button>
            </div>
          </div>
          <EmailPreview
            htmlSnippet={htmlSnippet}
            isLoading={previewMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}