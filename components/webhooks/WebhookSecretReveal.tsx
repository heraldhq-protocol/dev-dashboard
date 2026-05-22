"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FaCopy } from "react-icons/fa";
import { useState } from "react";

interface WebhookSecretRevealProps {
  isOpen: boolean;
  onClose: () => void;
  secret: string;
}

const NODE_SNIPPET = (secret: string) => `\
const crypto = require('crypto');

function verifyHeraldSignature(req) {
  const signature = req.headers['x-herald-signature'];
  const timestamp  = req.headers['x-herald-timestamp'];
  const body       = JSON.stringify(req.body); // must be the raw JSON string

  // Reject stale events (> 5 minutes)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', '${secret}')
    .update(\`\${timestamp}.\${body}\`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected,  'hex'),
  );
}`;

const PYTHON_SNIPPET = (secret: string) => `\
import hmac, hashlib, time

SECRET = "${secret}"

def verify_herald_signature(headers: dict, raw_body: str) -> bool:
    signature = headers.get("x-herald-signature", "")
    timestamp  = headers.get("x-herald-timestamp",  "")

    # Reject stale events (> 5 minutes)
    if abs(time.time() - float(timestamp)) > 300:
        return False

    payload  = f"{timestamp}.{raw_body}"
    expected = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)`;

type LangTab = "node" | "python";

export function WebhookSecretReveal({ isOpen, onClose, secret }: WebhookSecretRevealProps) {
  const [copied, setCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [tab, setTab] = useState<LangTab>("node");

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const snippetText = tab === "node" ? NODE_SNIPPET(secret) : PYTHON_SNIPPET(secret);

  const handleSnippetCopy = () => {
    navigator.clipboard.writeText(snippetText);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Webhook Created Successfully">
      <div className="space-y-4">
        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 text-sm font-medium">
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            This secret is only shown once. Copy it now and store it securely — you will use it to verify Herald webhook signatures.
          </p>
        </div>

        {/* Secret value */}
        <div className="bg-navy-3 border border-border p-4 rounded-xl flex items-center justify-between gap-4">
          <code className="text-foreground font-mono text-sm truncate">{secret}</code>
          <Button onClick={handleCopy} variant="secondary" size="sm" className="shrink-0 gap-2">
            <FaCopy className={copied ? "text-teal" : ""} />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* Verification snippet */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between bg-navy-3 px-4 py-2 border-b border-border">
            <span className="text-xs text-muted-foreground font-medium">Verify the signature</span>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md overflow-hidden border border-border text-xs">
                <button
                  onClick={() => setTab("node")}
                  className={`px-3 py-1 transition-colors ${tab === "node" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Node.js
                </button>
                <button
                  onClick={() => setTab("python")}
                  className={`px-3 py-1 transition-colors ${tab === "python" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Python
                </button>
              </div>
              <Button onClick={handleSnippetCopy} variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                <FaCopy className="w-3 h-3" />
                {snippetCopied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <pre className="bg-navy-4 p-4 text-xs text-foreground overflow-x-auto leading-relaxed max-h-64">
            <code>{snippetText}</code>
          </pre>
        </div>

        <p className="text-xs text-muted-foreground">
          Herald signs each request as <code className="font-mono">HMAC-SHA256(&quot;{"{timestamp}.{body}"}&quot;)</code>.
          Always verify before processing — and reject events older than 5 minutes.
        </p>

        <Button onClick={onClose} className="w-full">I have saved it securely</Button>
      </div>
    </Modal>
  );
}
