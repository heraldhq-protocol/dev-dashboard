"use client";

import { useState } from "react";
import { useComposerStore } from "@/hooks/use-composer-store";
import { PreviewEmail } from "./preview-email";
import { PreviewTelegram } from "./preview-telegram";
import { PreviewSms } from "./preview-sms";
import { TestDataPanel } from "./test-data-panel";
import { CodeExportPanel } from "./CodeExportPanel";
import { Code } from "lucide-react";

type PreviewTab = "preview" | "code";

export function ComposerPreview() {
  const { activeChannel } = useComposerStore();
  const [tab, setTab] = useState<PreviewTab>("preview");

  return (
    <div className="flex flex-col h-full bg-card-2/50 relative">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border px-3 py-2 bg-card shrink-0">
        <button
          onClick={() => setTab("preview")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            tab === "preview"
              ? "bg-secondary text-foreground"
              : "text-text-muted hover:text-foreground"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setTab("code")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            tab === "code"
              ? "bg-teal/15 text-teal border border-teal/25"
              : "text-text-muted hover:text-foreground"
          }`}
        >
          <Code className="w-3 h-3" />
          Export Code
        </button>
      </div>

      {tab === "preview" ? (
        <>
          <div className="flex-1 overflow-y-auto relative">
            {activeChannel === "email" && <PreviewEmail />}
            {activeChannel === "telegram" && <PreviewTelegram />}
            {activeChannel === "sms" && <PreviewSms />}
          </div>
          <div className="shrink-0">
            <TestDataPanel />
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0">
          <CodeExportPanel />
        </div>
      )}
    </div>
  );
}
