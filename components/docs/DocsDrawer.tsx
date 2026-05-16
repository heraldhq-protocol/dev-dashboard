"use client";

import { useState, useEffect } from "react";
import { useUiStore } from "@/lib/stores/ui.store";
import { X, ExternalLink, Search } from "lucide-react";
import { SyntaxBlock } from "@/components/shared/SyntaxBlock";

// ─── Content sections ──────────────────────────────────────

type DocSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

function CodeBlock({ code, lang = "typescript" }: { code: string; lang?: string }) {
  return <SyntaxBlock code={code.trim()} className="my-3 text-xs" />;
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-muted leading-relaxed mb-3">{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground mt-5 mb-2 first:mt-0">{children}</h3>;
}

function PropRow({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-border/40 last:border-0">
      <div className="w-[140px] shrink-0">
        <code className="text-xs font-mono text-teal">{name}</code>
        {required && <span className="ml-1 text-[9px] text-red font-bold uppercase">req</span>}
      </div>
      <div className="flex-1 min-w-0">
        <code className="text-[11px] font-mono text-text-muted/80">{type}</code>
        <p className="text-xs text-text-muted mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ErrorRow({ code, desc }: { code: string; desc: string }) {
  const isOk = code.startsWith("2");
  const isWarn = code.startsWith("4");
  return (
    <div className="flex gap-3 py-2 border-b border-border/40 last:border-0">
      <code className={`text-xs font-mono font-bold w-12 shrink-0 ${isOk ? "text-status-success" : isWarn ? "text-gold" : "text-red"}`}>
        {code}
      </code>
      <p className="text-xs text-text-muted">{desc}</p>
    </div>
  );
}

const SECTIONS: DocSection[] = [
  {
    id: "quickstart",
    title: "Quick Start",
    content: (
      <div>
        <H3>1. Install the SDK</H3>
        <CodeBlock lang="bash" code={`npm install @herald-protocol/sdk\n# or\npnpm add @herald-protocol/sdk`} />

        <H3>2. Initialize the client</H3>
        <Prose>Use your <code className="text-teal text-xs">hrld_live_...</code> key from the API Keys page.</Prose>
        <CodeBlock code={`import { Herald } from "@herald-protocol/sdk";

const herald = new Herald({
  apiKey: process.env.HERALD_API_KEY,
  environment: "production", // or "sandbox"
});`} />

        <H3>3. Send a notification</H3>
        <Prose>Herald uses a wallet address — no email required.</Prose>
        <CodeBlock code={`const result = await herald.notify({
  wallet: "7xR4mKp2nQ...", // Recipient's Solana address
  subject: "DeFi Alert: Liquidation Warning",
  body: "Your SOL-USDC position is at risk. HF: 1.05.",
  category: "defi",
  idempotencyKey: "tx_uuid_123",
});

console.log("Queued:", result.notificationId);`} />

        <H3>4. Check delivery status</H3>
        <CodeBlock code={`const status = await herald.getStatus(result.notificationId);
if (status.delivered) {
  console.log(\`Delivered via \${status.channel}\`);
}`} />
      </div>
    ),
  },
  {
    id: "notify-api",
    title: "notify() Reference",
    content: (
      <div>
        <Prose>Full parameter reference for <code className="text-teal text-xs">POST /v1/notify</code>.</Prose>

        <H3>Request body</H3>
        <div className="rounded-xl border border-border bg-card-2/30 px-3 py-1 mb-4">
          <PropRow name="wallet" type="string" required desc="Recipient's Solana public key (base58)" />
          <PropRow name="subject" type="string" required desc="Notification title (max 200 chars)" />
          <PropRow name="body" type="string" required desc="Notification body text" />
          <PropRow name="category" type="string" required desc="defi | governance | security | system | marketing" />
          <PropRow name="idempotencyKey" type="string" desc="Unique key to prevent duplicate sends (UUID recommended)" />
          <PropRow name="channels" type="string[]" desc="Override channel priority: ['email', 'telegram', 'sms']" />
        </div>

        <H3>SDK example</H3>
        <CodeBlock code={`await herald.notify({
  wallet: "7xR4mKp2nQ...",
  subject: "Governance Vote Live",
  body: "Proposal #42 is open. Voting ends in 48 hours.",
  category: "governance",
  channels: ["telegram", "email"],
});`} />

        <H3>cURL example</H3>
        <CodeBlock lang="bash" code={`curl -X POST https://api.useherald.xyz/v1/notify \\
  -H "Authorization: Bearer $HERALD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "wallet": "7xR4mKp2nQ...",
    "subject": "Test",
    "body": "Hello from Herald",
    "category": "defi"
  }'`} />

        <H3>Batch endpoint</H3>
        <Prose>Send up to 100 notifications in one request via <code className="text-teal text-xs">POST /v1/notify/batch</code>.</Prose>
        <CodeBlock code={`const { batchId } = await herald.notifyBatch([
  { wallet: "7xR4...", subject: "Update 1", body: "...", category: "defi" },
  { wallet: "9kPm...", subject: "Update 2", body: "...", category: "defi" },
]);`} />
      </div>
    ),
  },
  {
    id: "webhooks",
    title: "Webhooks",
    content: (
      <div>
        <Prose>Herald delivers real-time events to your endpoint. Every request includes an <code className="text-teal text-xs">X-Herald-Signature</code> header for verification.</Prose>

        <H3>Event types</H3>
        <div className="rounded-xl border border-border bg-card-2/30 px-3 py-1 mb-4 text-xs space-y-2 py-3">
          {[
            ["notification.delivered", "Message handed off to provider"],
            ["notification.bounced", "Email bounced (hard or soft)"],
            ["notification.failed", "Delivery failed after all retries"],
            ["receipt.minted", "ZK-proof written to Solana"],
            ["user.registered", "New wallet mapped to a contact channel"],
            ["quota.exceeded", "Protocol exceeded monthly quota"],
          ].map(([event, desc]) => (
            <div key={event} className="flex gap-3">
              <code className="text-teal w-[200px] shrink-0">{event}</code>
              <span className="text-text-muted">{desc}</span>
            </div>
          ))}
        </div>

        <H3>Payload shape</H3>
        <CodeBlock code={`{
  "id": "evt_01HX4...",
  "type": "notification.delivered",
  "created": 1614547200,
  "data": {
    "notification_id": "hrld_xxx",
    "wallet": "7xR4mKp2nQ...",
    "channel": "telegram",
    "deliveredAt": "2026-04-25T12:00:00Z"
  }
}`} />

        <H3>Signature verification</H3>
        <CodeBlock code={`import { createHmac, timingSafeEqual } from "node:crypto";

function verifyWebhook(payload: string, header: string, secret: string) {
  const [, ts] = header.split("t=");
  const [, sig] = header.split("v1=");
  const expected = createHmac("sha256", secret)
    .update(\`\${ts}.\${payload}\`)
    .digest("hex");
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}`} />
      </div>
    ),
  },
  {
    id: "error-codes",
    title: "Error Codes",
    content: (
      <div>
        <Prose>HTTP status codes returned by the Herald Gateway.</Prose>
        <div className="rounded-xl border border-border bg-card-2/30 px-3 py-1">
          <ErrorRow code="202" desc="Notification accepted and queued for delivery" />
          <ErrorRow code="400" desc="Invalid request body — check required fields and types" />
          <ErrorRow code="401" desc="Missing or invalid API key" />
          <ErrorRow code="403" desc="API key lacks required scope (e.g. notify:write)" />
          <ErrorRow code="404" desc="Wallet not registered — user hasn't opted in to Herald" />
          <ErrorRow code="409" desc="Duplicate idempotencyKey — notification already sent" />
          <ErrorRow code="429" desc="Rate limit exceeded — slow down or upgrade tier" />
          <ErrorRow code="503" desc="Gateway temporarily unavailable — retry with backoff" />
        </div>

        <H3>Rate limits by tier</H3>
        <div className="rounded-xl border border-border bg-card-2/30 px-3 py-1">
          {[
            ["Developer", "2 req/s", "1,000 / mo"],
            ["Growth", "20 req/s", "50,000 / mo"],
            ["Scale", "100 req/s", "250,000 / mo"],
            ["Enterprise", "500 req/s", "1,000,000 / mo"],
          ].map(([tier, rps, monthly]) => (
            <div key={tier} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0 text-xs">
              <span className="text-foreground font-semibold w-24 shrink-0">{tier}</span>
              <span className="text-text-muted w-20">{rps}</span>
              <span className="text-text-muted">{monthly}</span>
            </div>
          ))}
        </div>

        <H3>SDK error handling</H3>
        <CodeBlock code={`try {
  await herald.notify({ wallet, subject, body, category });
} catch (err) {
  if (err.status === 404) {
    // Wallet not opted in — skip silently
  } else if (err.status === 429) {
    // Back off and retry
  } else {
    throw err;
  }
}`} />
      </div>
    ),
  },
];

// ─── DocsDrawer ─────────────────────────────────────────────

export function DocsDrawer() {
  const { isDocsOpen, closeDocs } = useUiStore();
  const [activeTab, setActiveTab] = useState("quickstart");
  const [search, setSearch] = useState("");

  // Ctrl+/ keyboard shortcut handled in TopNav/layout — drawer close with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDocsOpen) closeDocs();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDocsOpen, closeDocs]);

  const filteredSections = search.trim()
    ? SECTIONS.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : SECTIONS;

  const activeSection = SECTIONS.find((s) => s.id === activeTab) ?? SECTIONS[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDocsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDocs}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] flex flex-col bg-navy-2 border-l border-border shadow-[−20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isDocsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-teal/10 border border-teal/20 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">Quick Reference</span>
            <span className="text-[10px] font-bold text-teal bg-teal/10 border border-teal/20 px-1.5 py-0.5 rounded">
              Ctrl+/
            </span>
          </div>
          <button
            onClick={closeDocs}
            className="h-7 w-7 rounded-md text-text-muted hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search sections…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-teal/50 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-2 border-b border-border overflow-x-auto shrink-0">
          {(search.trim() ? filteredSections : SECTIONS).map((section) => (
            <button
              key={section.id}
              onClick={() => { setActiveTab(section.id); setSearch(""); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                activeTab === section.id && !search.trim()
                  ? "bg-teal/10 text-teal border border-teal/20"
                  : "text-text-muted hover:text-foreground hover:bg-secondary"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filteredSections.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-12">No sections match &ldquo;{search}&rdquo;</p>
          ) : search.trim() ? (
            <div className="space-y-6">
              {filteredSections.map((s) => (
                <div key={s.id}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">{s.title}</h2>
                  {s.content}
                </div>
              ))}
            </div>
          ) : (
            activeSection.content
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">Herald Protocol Docs</span>
          <a
            href="https://useherald.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
          >
            Full docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </aside>
    </>
  );
}
