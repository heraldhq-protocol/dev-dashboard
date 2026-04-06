"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TestSendDto } from "@/types/api";

interface EmailComposerProps {
  onPreview: (dto: TestSendDto) => void;
  onSend: (dto: TestSendDto) => void;
  isLoading: boolean;
}

const CATEGORIES = ["defi", "governance", "system", "marketing"] as const;

export function EmailComposer({ onPreview, onSend, isLoading }: EmailComposerProps) {
  const [walletAddress, setWalletAddress] = useState("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
  const [subject, setSubject] = useState("Your liquidation is at risk");
  const [body, setBody] = useState("Your margin account on the Solend protocol is nearing its liquidation threshold.\n\nPlease deposit more collateral to avoid liquidation.");
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
      <h3 className="text-lg font-bold text-foreground mb-4">Compose</h3>
      
      <div className="space-y-4 flex-1">
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
            Content (Markdown)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full flex-1 min-h-[200px] bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-3 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/50 transition-colors resize-none font-mono"
            placeholder="Write your email body here..."
            required
          />
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-border flex justify-end gap-3 shrink-0">
        <Button 
          variant="secondary" 
          onClick={() => onPreview(buildDto(true))}
          disabled={isLoading || !walletAddress || !subject || !body}
        >
          Preview HTML
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
