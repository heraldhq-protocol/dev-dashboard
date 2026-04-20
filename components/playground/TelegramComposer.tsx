"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TestSendDto } from "@/types/api";

interface TelegramComposerProps {
  onPreview: (dto: TestSendDto) => void;
  onSend: (dto: TestSendDto) => void;
  isLoading: boolean;
}

const CATEGORIES = ["defi", "governance", "system", "marketing"] as const;

const MARKDOWN_HELP = `Telegram HTML Formatting:
<b>bold</b> or <i>italic</i>
<code>inline code</code>
<pre>code block</pre>
<a href="https://example.com">link</a>

Markdown Shortcuts (auto-converted):
**bold** → <b>bold</b>
*italic* → <i>italic</i>
\`code\` → <code>code</code>
[text](url) → inline button
`;

export function TelegramComposer({ onPreview, onSend, isLoading }: TelegramComposerProps) {
  const [walletAddress, setWalletAddress] = useState("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
  const [subject, setSubject] = useState("Liquidation Warning");
  const [body, setBody] = useState("Your margin account is nearing liquidation threshold.\n\n*Action Required:* Deposit more collateral to avoid liquidation.\n\nCheck your [dashboard](https://solend.fi) for details.");
  const [category, setCategory] = useState<TestSendDto["category"]>("defi");

  const buildDto = (previewOnly = false): TestSendDto => ({
    walletAddress,
    subject,
    body,
    category,
    previewOnly,
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-4">Telegram Composer</h3>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Target Wallet
          </label>
          <Input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Solana Wallet Address"
            className="w-full font-mono text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/50 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Subject
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Notification Subject"
            className="w-full font-medium"
            required
          />
        </div>

        <div className="space-y-1.5 flex-1 flex flex-col">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Message (Markdown)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full flex-1 min-h-[150px] bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-3 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/50 transition-colors resize-none font-mono"
            placeholder="Write your message here..."
            required
          />
          <details className="mt-2">
            <summary className="text-xs text-text-muted cursor-pointer hover:text-foreground transition-colors">
              View formatting syntax
            </summary>
            <pre className="mt-2 p-2 bg-card-2 rounded text-xs text-text-muted overflow-x-auto whitespace-pre-wrap font-mono">
{MARKDOWN_HELP}
            </pre>
            <p className="mt-2 text-xs text-text-muted">
              <strong>Tip:</strong> Links like <code>[Dashboard](https://url)</code> become inline keyboard buttons in Telegram.
            </p>
          </details>
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-border flex justify-end gap-3 shrink-0">
        <Button 
          variant="secondary" 
          onClick={() => onPreview(buildDto(true))}
          disabled={isLoading || !walletAddress || !subject || !body}
        >
          Preview
        </Button>
        <Button 
          variant="default"
          isLoading={isLoading}
          disabled={isLoading || !walletAddress || !subject || !body}
          onClick={() => onSend(buildDto(false))}
          className="shadow-[0_0_15px_rgba(0,200,150,0.2)]"
        >
          Send Test
        </Button>
      </div>
    </div>
  );
}