"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FaCopy, FaCheck } from "react-icons/fa";

type ButtonProps = React.ComponentProps<typeof Button>;

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  text: string;
}

export function CopyButton({ text, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!text) {
      console.error("No text to copy");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  if (!text) {
    return (
      <Button disabled size="sm" variant="ghost" className="shrink-0 opacity-50" {...props}>
        Copy
      </Button>
    );
  }

  return (
    <Button onClick={handleCopy} size="sm" variant="ghost" className="shrink-0" {...props}>
      {copied ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
    </Button>
  );
}
