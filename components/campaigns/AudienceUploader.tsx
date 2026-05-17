"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// Validate a Solana-style base58 wallet address (32-44 chars)
function isValidWallet(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address.trim());
}

interface AudienceUploaderProps {
  onWallets: (wallets: string[]) => void;
  value?: string[];
}

export function AudienceUploader({ onWallets, value = [] }: AudienceUploaderProps) {
  const [rawText, setRawText] = useState<string>(value.join("\n"));
  const [invalidAddresses, setInvalidAddresses] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const processText = useCallback(
    (text: string) => {
      setRawText(text);
      const lines = text
        .split(/[\n,\s]+/)
        .map((l) => l.trim())
        .filter(Boolean);

      const invalid = new Set<string>();
      const valid: string[] = [];

      for (const line of lines) {
        if (isValidWallet(line)) {
          valid.push(line);
        } else {
          invalid.add(line);
        }
      }

      setInvalidAddresses(invalid);
      onWallets(valid);
    },
    [onWallets]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      processText(text);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const validCount = rawText
    .split(/[\n,\s]+/)
    .map((l) => l.trim())
    .filter((l) => l && isValidWallet(l)).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary">
          Wallet Addresses
        </label>
        <div className="flex items-center gap-2">
          {validCount > 0 && (
            <span className="text-[10px] font-semibold text-teal bg-teal/10 border border-teal/20 px-2 py-0.5 rounded-full">
              {validCount.toLocaleString()} valid
            </span>
          )}
          {invalidAddresses.size > 0 && (
            <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
              {invalidAddresses.size} invalid
            </span>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-teal transition-colors border border-border rounded px-2 py-0.5"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <textarea
        className={cn(
          "w-full rounded-lg border bg-card-2 px-3 py-2 text-xs font-mono text-foreground placeholder:text-text-dim",
          "focus:outline-none focus:ring-1 focus:ring-teal resize-none",
          invalidAddresses.size > 0 ? "border-red-500/40" : "border-border"
        )}
        rows={8}
        placeholder={"Paste wallet addresses here, one per line…\n\ne.g.:\n7xKXt…YqAv\n3Pu9s…abc1\n…"}
        value={rawText}
        onChange={(e) => processText(e.target.value)}
        spellCheck={false}
      />

      {invalidAddresses.size > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1.5">
            {invalidAddresses.size} invalid address{invalidAddresses.size !== 1 ? "es" : ""} — will be skipped
          </p>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {Array.from(invalidAddresses)
              .slice(0, 20)
              .map((addr) => (
                <code
                  key={addr}
                  className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"
                >
                  {addr.length > 20 ? addr.slice(0, 10) + "…" + addr.slice(-6) : addr}
                </code>
              ))}
            {invalidAddresses.size > 20 && (
              <span className="text-[10px] text-red-400/70">
                +{invalidAddresses.size - 20} more
              </span>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-text-dim">
        One address per line, or comma/space separated. CSV files with a header row are automatically parsed.
      </p>
    </div>
  );
}
