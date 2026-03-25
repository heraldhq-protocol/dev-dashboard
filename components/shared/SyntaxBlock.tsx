"use client";

import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

export function SyntaxBlock({ code, className }: { code: string, className?: string }) {
  return (
    <div className={cn("relative group rounded-lg border border-border bg-navy-2 overflow-hidden", className)}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton variant="secondary" size="sm" text={code} />
      </div>
      <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
