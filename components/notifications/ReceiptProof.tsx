"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface ReceiptProofProps {
  receiptTx?: string | null;
  status: string;
  errorCode?: string | null;
  receiptFailureReason?: string | null;
}

export function ReceiptProof({ receiptTx, status, errorCode, receiptFailureReason }: ReceiptProofProps) {
  const [copied, setCopied] = useState(false);

  const isPending = status === "queued" || status === "processing";

  if (receiptTx) {
    const short = `${receiptTx.slice(0, 6)}...${receiptTx.slice(-6)}`;

    const copy = () => {
      navigator.clipboard.writeText(receiptTx);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal shrink-0" />
          <span className="text-xs text-teal font-semibold uppercase tracking-wide">Anchored on-chain</span>
        </div>
        <div className="flex items-center gap-2 bg-navy/60 border border-teal/20 rounded-lg px-3 py-2">
          <code className="text-xs font-mono text-foreground flex-1 break-all">{short}</code>
          <button
            onClick={copy}
            className="text-text-muted hover:text-foreground transition-colors shrink-0 p-0.5"
            title="Copy full transaction hash"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <a
            href={`https://solscan.io/tx/${receiptTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-teal transition-colors shrink-0 p-0.5"
            title="View on Solscan"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="text-[11px] text-text-muted">
          Delivery confirmed and recorded on the Solana blockchain.
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold shrink-0 animate-pulse" />
          <span className="text-xs text-gold font-semibold uppercase tracking-wide">Awaiting anchor</span>
        </div>
        <p className="text-xs text-text-muted">
          Notification is in queue — the on-chain receipt will appear once delivery is confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red shrink-0" />
        <span className="text-xs text-red font-semibold uppercase tracking-wide">Not anchored</span>
      </div>
      <p className="text-xs text-text-muted">
        {receiptFailureReason
          ? receiptFailureReason
          : errorCode
          ? `Delivery failed — no on-chain receipt was generated. Error: ${errorCode}`
          : "Receipt pending — will be anchored on the next batch cycle (every 5 minutes)."}
      </p>
    </div>
  );
}
