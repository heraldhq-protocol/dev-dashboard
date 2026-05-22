"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { testWebhook } from "@/lib/api/webhooks";

interface WebhookTestButtonProps {
  webhookId: string;
  endpointUrl: string;
}

export function WebhookTestButton({ webhookId, endpointUrl: _endpointUrl }: WebhookTestButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "queued" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTest = async () => {
    setStatus("sending");
    setErrorMsg(null);
    try {
      await testWebhook(webhookId);
      setStatus("queued");
    } catch (err: any) {
      setStatus("error");
      // Surface a short reason if the API returned one
      setErrorMsg(err?.response?.data?.message ?? err?.message ?? "Request failed");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <Button
      variant={status === "error" ? "destructive" : status === "queued" ? "default" : "outline"}
      size="sm"
      onClick={handleTest}
      disabled={status === "sending"}
      className="min-w-[100px] text-xs"
      title={status === "error" && errorMsg ? errorMsg : undefined}
    >
      {status === "idle" && "Send Test"}
      {status === "sending" && "Sending..."}
      {status === "queued" && "✓ Dispatched"}
      {status === "error" && "✗ Failed"}
    </Button>
  );
}
