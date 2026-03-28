import { SolscanLink } from "@/components/shared/SolscanLink";

export function ReceiptProof({ signature }: { signature?: string }) {
  if (!signature) return <span className="text-text-muted text-xs font-mono">- pending</span>;
  
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-teal shrink-0 animate-pulse" />
      <SolscanLink txHash={signature} shorten />
    </div>
  );
}
