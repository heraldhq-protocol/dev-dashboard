"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/notifications/StatusBadge";
import { ReceiptProof } from "@/components/notifications/ReceiptProof";
import { SyntaxBlock } from "@/components/shared/SyntaxBlock";
import { FaChevronLeft } from "react-icons/fa";

export default function NotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // MOCK DATA for specific ID
  const rawPayload = JSON.stringify({
    to: "7aV...9xK",
    category: "defi",
    priority: "high",
    content: {
      subject: "Liquidator Warning",
      body: "Your position is close to liquidation... <html>..."
    }
  }, null, 2);

  return (
    <div className="space-y-6 max-w-4xl w-full pt-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-text-muted hover:text-foreground px-2 h-auto py-1 gap-2 cursor-pointer" onClick={() => router.back()}>
          <FaChevronLeft /> Back
        </Button>
        <h1 className="text-base font-bold tracking-tight text-foreground font-mono break-all">{id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-2 border border-border-2 rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Delivery Metadata</h3>
          
          <div className="grid grid-cols-2 gap-y-4 text-sm mt-4">
            <div className="text-text-muted">Status</div>
            <div><StatusBadge status="delivered" /></div>

            <div className="text-text-muted">Target Wallet</div>
            <div className="text-teal font-mono font-medium">7aV...9xK</div>

            <div className="text-text-muted">Category</div>
            <div className="capitalize text-foreground">DeFi Alerts</div>

            <div className="text-text-muted">Timestamp</div>
            <div className="text-foreground">Mar 15, 2026, 14:32:01 UTC</div>

            <div className="text-text-muted">Receipt Tx</div>
            <div><ReceiptProof signature="5xR9K7Lp1N2vM...8wQj" /></div>
          </div>
        </div>

        <div className="bg-navy-2 border border-border-2 rounded-xl p-6 shadow-xl flex flex-col">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Raw Transport Payload</h3>
          <div className="flex-1 overflow-hidden relative">
            <SyntaxBlock code={rawPayload} className="h-full bg-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
