"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
}

export function CopyButton({ text, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy text");
    }
  };

  return (
    <Button onClick={handleCopy} {...props}>
      {copied ? "Copied ✓" : "Copy"}
    </Button>
  );
}
