"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmailComposer } from "@/components/playground/EmailComposer";
import { TelegramComposer } from "@/components/playground/TelegramComposer";
import { SmsComposer } from "@/components/playground/SmsComposer";
import { EmailPreview } from "@/components/playground/EmailPreview";
import { testSend, getApiKeys, type ApiKeyInfo } from "@/lib/api/notifications";
import { Button } from "@/components/ui/Button";
import { TestSendDto } from "@/types/api";
import { isAxiosError } from "axios";

type ChannelTab = "email" | "telegram" | "sms";

export default function PlaygroundPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ChannelTab>("email");
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"html" | "telegram" | "sms">("html");
  const [selectedApiKey, setSelectedApiKey] = useState<string>("");

  const { data: apiKeys, isLoading: loadingKeys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: getApiKeys,
  });

  const previewMutation = useMutation({
    mutationFn: (dto: TestSendDto) => {
      if (!selectedApiKey) {
        throw new Error("Please select an API key first");
      }
      return testSend({ ...dto, previewOnly: true }, selectedApiKey);
    },
    onSuccess: (data) => {
      if (data.renderedHtml) {
        setHtmlSnippet(data.renderedHtml);
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
      if (!selectedApiKey) {
        throw new Error("Please select an API key first");
      }
      return testSend({ ...dto, previewOnly: false }, selectedApiKey);
    },
    onSuccess: (data) => {
      toast.success("Test notification sent!");
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
    <div className="flex flex-col lg:h-[calc(100vh-8rem)] space-y-6">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Notification Playground
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Draft and preview notifications across channels.
        </p>
      </div>

      {/* API Key Selection */}
      <div className="flex items-center gap-3 p-3 bg-card-2 rounded-lg border border-border">
        <label className="text-sm font-medium text-text-secondary">
          API Key:
        </label>
        {loadingKeys ? (
          <span className="text-sm text-text-muted">Loading...</span>
        ) : apiKeys && apiKeys.length > 0 ? (
          <>
            <select
              value={selectedApiKey}
              onChange={(e) => setSelectedApiKey(e.target.value)}
              className="flex-1 max-w-xs bg-card border border-border text-foreground text-sm rounded-lg px-3 py-2"
            >
              <option value="">Select an API key...</option>
              {apiKeys.map((key) => (
                <option key={key.id} value={key.key}>
                  {key.name} ({key.environment}) - {key.keyPrefix}...
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["api-keys"] })}
            >
              Refresh
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red">No API keys found.</span>
            <Button
              variant="default"
              size="sm"
              onClick={() => (window.location.href = "/settings?tab=api-keys")}
            >
              Create API Key
            </Button>
          </div>
        )}
      </div>

      {/* Channel Tabs */}
      <div className="flex border-b border-border mb-4">
        {(["email", "telegram", "sms"] as ChannelTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "text-foreground border-primary"
                : "text-text-muted border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
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

        {/* Preview Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Preview</h3>
            <div className="flex gap-1">
              {activeTab === "email" && (
                <button
                  onClick={() => setPreviewMode("html")}
                  className={`px-2 py-1 text-xs rounded ${
                    previewMode === "html" ? "bg-primary text-foreground" : "text-text-muted"
                  }`}
                >
                  HTML
                </button>
              )}
              {activeTab === "telegram" && (
                <button
                  onClick={() => setPreviewMode("telegram")}
                  className={`px-2 py-1 text-xs rounded ${
                    previewMode === "telegram" ? "bg-primary text-foreground" : "text-text-muted"
                  }`}
                >
                  Telegram
                </button>
              )}
              {activeTab === "sms" && (
                <button
                  onClick={() => setPreviewMode("sms")}
                  className={`px-2 py-1 text-xs rounded ${
                    previewMode === "sms" ? "bg-primary text-foreground" : "text-text-muted"
                  }`}
                >
                  SMS
                </button>
              )}
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