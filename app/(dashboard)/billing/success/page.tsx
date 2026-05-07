"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getBillingStatus } from "@/lib/api/billing";

const TIER_NAMES: Record<string, string> = {
  "0": "Developer",
  "1": "Growth",
  "2": "Scale",
  "3": "Enterprise",
};

export default function BillingSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = params.get("tier") ?? "1";
  const months = params.get("months") ?? "1";

  const [verified, setVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(5);

  // Poll billing status until the tier is updated (webhook may take a few seconds)
  useEffect(() => {
    const expectedTier = parseInt(tier, 10);
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const status = await getBillingStatus();
        if (status.tier >= expectedTier) {
          setVerified(true);
          return;
        }
      } catch {
        // ignore — keep polling
      }
      setAttempts((n) => n + 1);
      if (attempts < 12) {
        setTimeout(poll, 2500);
      }
    };

    poll();
    return () => { stopped = true; };
  }, []);

  // Auto-redirect once verified
  useEffect(() => {
    if (!verified) return;
    const id = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(id);
          router.push("/billing");
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [verified, router]);

  const tierName = TIER_NAMES[tier] ?? `Tier ${tier}`;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6">
        {verified ? (
          <>
            {/* Success state */}
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-teal/10 border border-teal/30 mx-auto">
              <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment confirmed!</h1>
              <p className="text-text-muted mt-2">
                Your plan has been upgraded to <span className="text-teal font-semibold">{tierName}</span>
                {months !== "1" && ` for ${months} months`}.
              </p>
            </div>
            <p className="text-sm text-text-muted">
              Redirecting to billing in {countdown}s…
            </p>
            <Button onClick={() => router.push("/billing")} className="w-full">
              Go to Billing
            </Button>
          </>
        ) : attempts >= 12 ? (
          <>
            {/* Timeout — webhook may be delayed */}
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 mx-auto">
              <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment received</h1>
              <p className="text-text-muted mt-2">
                Your payment is being processed. It may take a minute or two for your plan to update.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => window.location.reload()} className="flex-1">
                Check again
              </Button>
              <Button onClick={() => router.push("/billing")} className="flex-1">
                Go to Billing
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Polling state */}
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-teal/5 border border-teal/20 mx-auto">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Confirming payment…</h1>
              <p className="text-text-muted mt-2">
                Verifying your <span className="text-teal font-semibold">{tierName}</span> subscription.
              </p>
            </div>
            <p className="text-xs text-text-muted">This usually takes a few seconds.</p>
          </>
        )}
      </div>
    </div>
  );
}
