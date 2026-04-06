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

export function WebhookSecretReveal({ isOpen, onClose, secret }: WebhookSecretRevealProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Webhook Created Successfully">
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 text-sm font-medium">
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            This is your webhook signing secret. It is only shown once. Please copy it and store it securely. You will use it to verify the Herald signature on incoming requests.
          </p>
        </div>

        <div className="bg-navy-3 border border-border p-4 rounded-xl flex items-center justify-between gap-4">
          <code className="text-foreground font-mono truncate">{secret}</code>
          <Button onClick={handleCopy} variant="secondary" size="sm" className="shrink-0 gap-2">
            <FaCopy className={copied ? "text-teal" : ""} />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="w-full">I have saved it securely</Button>
        </div>
      </div>
    </Modal>
  );
}
