"use client";

import { useState } from "react";
import { useComposerStore } from "@/hooks/use-composer-store";
import { usePlaygroundKey } from "@/hooks/use-playground-key";
import { SyntaxBlock } from "@/components/shared/SyntaxBlock";

type Lang = "typescript" | "javascript" | "curl" | "python";

function buildChannelsArray(
  channel: string,
  emailContent: string,
  telegramContent: string,
  smsContent: string
): string[] {
  // Only include channels that have non-default content (best-effort heuristic)
  const active: string[] = [];
  if (channel === "email" || emailContent.trim()) active.push("email");
  if (channel === "telegram" || telegramContent.trim()) active.push("telegram");
  if (channel === "sms" || smsContent.trim()) active.push("sms");
  // Always at least include the active channel
  if (!active.includes(channel)) active.unshift(channel);
  return active;
}

function indent(lines: string, spaces = 2): string {
  return lines
    .split("\n")
    .map((l) => " ".repeat(spaces) + l)
    .join("\n");
}

function generateTypescript(
  subject: string,
  body: string,
  category: string,
  channels: string[],
  apiKey: string
): string {
  const channelStr = JSON.stringify(channels);
  return `import { Herald } from "@herald-protocol/sdk";

const herald = new Herald({
  apiKey: process.env.HERALD_API_KEY ?? "${apiKey ? apiKey.slice(0, 16) + "…" : "hrld_test_…"}",
});

await herald.notify({
  wallet: "RECIPIENT_WALLET_ADDRESS",
  subject: ${JSON.stringify(subject)},
  body: ${JSON.stringify(body)},
  category: ${JSON.stringify(category)},
  channels: ${channelStr},
});`;
}

function generateJavascript(
  subject: string,
  body: string,
  category: string,
  channels: string[],
  apiKey: string
): string {
  const channelStr = JSON.stringify(channels);
  return `const { Herald } = require("@herald-protocol/sdk");

const herald = new Herald({
  apiKey: process.env.HERALD_API_KEY ?? "${apiKey ? apiKey.slice(0, 16) + "…" : "hrld_test_…"}",
});

await herald.notify({
  wallet: "RECIPIENT_WALLET_ADDRESS",
  subject: ${JSON.stringify(subject)},
  body: ${JSON.stringify(body)},
  category: ${JSON.stringify(category)},
  channels: ${channelStr},
});`;
}

function generateCurl(
  subject: string,
  body: string,
  category: string,
  channels: string[],
  apiKey: string
): string {
  const payload = JSON.stringify(
    {
      wallet: "RECIPIENT_WALLET_ADDRESS",
      subject,
      body,
      category,
      channels,
    },
    null,
    2
  );
  const keyDisplay = apiKey ? apiKey.slice(0, 16) + "…" : "hrld_test_…";
  return `curl -X POST https://api.useherald.xyz/v1/notify \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '${payload}'`;
}

function generatePython(
  subject: string,
  body: string,
  category: string,
  channels: string[],
  apiKey: string
): string {
  const channelStr = JSON.stringify(channels);
  const keyDisplay = apiKey ? apiKey.slice(0, 16) + "…" : "hrld_test_…";
  return `import httpx
import os

API_KEY = os.getenv("HERALD_API_KEY", "${keyDisplay}")

payload = {
    "wallet": "RECIPIENT_WALLET_ADDRESS",
    "subject": ${JSON.stringify(subject)},
    "body": ${JSON.stringify(body)},
    "category": ${JSON.stringify(category)},
    "channels": ${channelStr},
}

with httpx.Client() as client:
    response = client.post(
        "https://api.useherald.xyz/v1/notify",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=payload,
    )
    response.raise_for_status()
    print(response.json())`;
}

const LANG_LABELS: Record<Lang, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  curl: "cURL",
  python: "Python",
};

export function CodeExportPanel() {
  const [activeLang, setActiveLang] = useState<Lang>("typescript");
  const store = useComposerStore();
  const { activeKey } = usePlaygroundKey();

  const channels = buildChannelsArray(
    store.activeChannel,
    store.emailContent,
    store.telegramContent,
    store.smsContent
  );

  const activeBody =
    store.activeChannel === "email"
      ? store.emailContent
      : store.activeChannel === "telegram"
        ? store.telegramContent
        : store.smsContent;

  const snippets: Record<Lang, string> = {
    typescript: generateTypescript(
      store.emailSubject,
      activeBody,
      "system",
      channels,
      activeKey
    ),
    javascript: generateJavascript(
      store.emailSubject,
      activeBody,
      "system",
      channels,
      activeKey
    ),
    curl: generateCurl(store.emailSubject, activeBody, "system", channels, activeKey),
    python: generatePython(
      store.emailSubject,
      activeBody,
      "system",
      channels,
      activeKey
    ),
  };

  return (
    <div className="flex flex-col h-full bg-card-2/50">
      {/* Lang tabs */}
      <div className="flex items-center gap-1 border-b border-border px-3 py-2 bg-card shrink-0">
        {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeLang === lang
                ? "bg-teal/15 text-teal border border-teal/25"
                : "text-text-muted hover:text-foreground hover:bg-secondary"
            }`}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-teal" />
          Live — updates as you type
        </div>
      </div>

      {/* Snippet */}
      <div className="flex-1 overflow-y-auto p-3">
        <SyntaxBlock code={snippets[activeLang]} className="h-full" />
      </div>

      {/* Footer hint */}
      <div className="shrink-0 border-t border-border px-4 py-2.5 bg-card">
        <p className="text-[10px] text-text-muted">
          Replace{" "}
          <code className="font-mono bg-secondary px-1 py-0.5 rounded text-[9px]">
            RECIPIENT_WALLET_ADDRESS
          </code>{" "}
          with the wallet pubkey of your user.{" "}
          <a
            href="https://useherald.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            Full SDK docs →
          </a>
        </p>
      </div>
    </div>
  );
}
