"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TestSendDto } from "@/types/api";

interface SmsComposerProps {
  onPreview: (dto: TestSendDto) => void;
  onSend: (dto: TestSendDto) => void;
  isLoading: boolean;
}

const CATEGORIES = ["defi", "governance", "system", "marketing"] as const;

const SMS_LIMITS = {
  defi: 320,
  system: 320,
  governance: 160,
  marketing: 160,
};

export function SmsComposer({ onPreview, onSend, isLoading }: SmsComposerProps) {
  const [walletAddress, setWalletAddress] = useState("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
  const [subject, setSubject] = useState("Alert");
  const [body, setBody] = useState("Your account requires attention. Please check your dashboard.");
  const [category, setCategory] = useState<TestSendDto["category"]>("defi");

  const maxChars = SMS_LIMITS[category] || 160;
  const prefix = `[${subject}]: `;
  const suffix = " (via Herald)";
  const bodyLimit = maxChars - prefix.length - suffix.length;
  const charCount = body.length;
  const isOverLimit = charCount > bodyLimit;

  const buildDto = (previewOnly = false): TestSendDto => ({
    walletAddress,
    subject,
    body,
    category,
    previewOnly,
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-4">SMS Composer</h3>
      
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
            Category (affects length limit)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-card-2 border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/50 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()} ({SMS_LIMITS[c]} chars)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Short Subject
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Alert"
            className="w-full font-medium"
            maxLength={20}
            required
          />
          <p className="text-xs text-text-muted">Keep it brief — SMS has character limits</p>
        </div>

        <div className="space-y-1.5 flex-1 flex flex-col">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex justify-between">
            <span>Body</span>
            <span className={isOverLimit ? "text-red font-normal" : "text-text-muted font-normal"}>
              {charCount}/{bodyLimit} chars
            </span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`w-full flex-1 min-h-[100px] bg-card-2 border text-foreground text-sm rounded-lg px-3 py-3 focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/50 transition-colors resize-none font-mono ${isOverLimit ? "border-red" : "border-border"}`}
            placeholder="Write your SMS body here..."
            required
          />
          {isOverLimit && (
            <p className="text-xs text-red">
              Text will be truncated. Reduce {charCount - bodyLimit} characters.
            </p>
          )}
          <p className="text-xs text-text-muted">
            <strong>Tip:</strong> Links are automatically stripped from SMS (use Telegram or Email for links).
          </p>
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-border flex justify-end gap-3 shrink-0">
        <Button 
          variant="secondary" 
          onClick={() => onPreview(buildDto(true))}
          disabled={isLoading || !walletAddress || !subject || !body || isOverLimit}
        >
          Preview
        </Button>
        <Button 
          variant="default"
          isLoading={isLoading}
          disabled={isLoading || !walletAddress || !subject || !body || isOverLimit}
          onClick={() => onSend(buildDto(false))}
          className="shadow-[0_0_15px_rgba(0,200,150,0.2)]"
        >
          Send Test
        </Button>
      </div>
    </div>
  );
}