"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface WebhookTestButtonProps {
  webhookId: string;
  endpointUrl: string;
}

export function WebhookTestButton({ webhookId, endpointUrl }: WebhookTestButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleTest = async () => {
    setStatus("sending");
    // MOCK: simulate test payload delivery
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      setStatus("success");
    } else {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 3000);
  };

  // Suppress lint: webhookId and endpointUrl will be used in production API call
  void webhookId;
  void endpointUrl;

  return (
    <Button
      variant={status === "error" ? "danger" : status === "success" ? "primary" : "outline"}
      size="sm"
      onClick={handleTest}
      isLoading={status === "sending"}
      disabled={status === "sending"}
      className="min-w-[100px] text-xs"
    >
      {status === "idle" && "Send Test"}
      {status === "sending" && "Sending..."}
      {status === "success" && "✓ 200 OK"}
      {status === "error" && "✗ Failed"}
    </Button>
  );
}
