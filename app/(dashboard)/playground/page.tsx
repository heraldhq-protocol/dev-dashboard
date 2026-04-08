"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmailComposer } from "@/components/playground/EmailComposer";
import { EmailPreview } from "@/components/playground/EmailPreview";
import { testSend } from "@/lib/api/notifications";
import { TestSendDto } from "@/types/api";
import { isAxiosError } from "axios";


export default function PlaygroundPage() {
  const queryClient = useQueryClient();
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);

  const previewMutation = useMutation({
    mutationFn: (dto: TestSendDto) => testSend({ ...dto, previewOnly: true }),
    onSuccess: (data) => {
      if (data.renderedHtml) {
        setHtmlSnippet(data.renderedHtml);
      }
    },
    onError: (err: unknown) => {
      if(isAxiosError(err)){
        toast.error(err?.response?.data?.message || "Failed to render preview");
      }
      if(err instanceof Error){
        return err.message;
      }
      toast.error("Failed to render preview");
    },
  });

  const sendMutation = useMutation({
    mutationFn: (dto: TestSendDto) => testSend({ ...dto, previewOnly: false }),
    onSuccess: (data) => {
      toast.success("Sandbox test notification sent successfully!");
      if (data.renderedHtml) {
        setHtmlSnippet(data.renderedHtml);
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // In Feature 6 we will show recent sends below
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send notification");
    },
  });

  return (
    <div className="flex flex-col lg:h-[calc(100vh-8rem)] space-y-6">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email Playground
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Draft and preview notifications in sandbox mode before going live. Sandbox is limited to 100 sends per day.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <EmailComposer 
          onPreview={(dto) => previewMutation.mutate(dto)}
          onSend={(dto) => sendMutation.mutate(dto)}
          isLoading={previewMutation.isPending || sendMutation.isPending}
        />
        <EmailPreview 
          htmlSnippet={htmlSnippet} 
          isLoading={previewMutation.isPending}
        />
      </div>

      {/* Feature 6 space for Notifications table stub */}
    </div>
  );
}
