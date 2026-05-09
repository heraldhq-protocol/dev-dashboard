"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { RippleWaveLoader } from "@/components/ui/pulsating-loader";
import { syncDevTier, getBillingStatus } from "@/lib/api/billing";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(true);

  const tier = searchParams.get("tier");
  const months = searchParams.get("months");

  useEffect(() => {
    async function verifyStatus() {
      try {
        // In development, Helio webhooks can't reach localhost. Force a sync.
        if (process.env.NODE_ENV === "development" && tier) {
          try {
            await syncDevTier(Number(tier));
          } catch (e) {
            console.error("Dev sync failed", e);
          }
        }

        const status = await getBillingStatus();
        if (status && status.tier >= Number(tier || 0)) {
          // Success! Invalidate the cache so the billing page refetches when we navigate back
          await queryClient.invalidateQueries({ queryKey: ["billingStatus"] });
          await queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
          setIsVerifying(false);
          // The interval is cleared by the return function or manually here
          return true;
        }
      } catch (err) {
        console.error("Failed to verify billing status:", err);
      }
      return false;
    }

    // Initial check
    verifyStatus();

    // Polling
    const interval = setInterval(async () => {
      const isDone = await verifyStatus();
      if (isDone) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tier, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center border-teal/20 bg-linear-to-b from-navy-2 to-navy shadow-2xl shadow-teal/5">
          {isVerifying ? (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <RippleWaveLoader />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Finalizing Upgrade
                </h2>
                <p className="text-sm text-text-muted">
                  We're confirming your transaction. Your dashboard will update in a moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="p-3 rounded-full bg-teal/10 border border-teal/30">
                  <CheckCircle2 className="w-12 h-12 text-teal" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Payment Successful!
                </h2>
                <p className="text-sm text-text-muted px-4">
                  Your subscription has been successfully upgraded. Thank you for choosing Herald!
                </p>
              </div>

              <div className="bg-navy-2/50 rounded-xl p-4 border border-border/50 text-left space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">New Plan</span>
                  <span className="text-foreground font-medium uppercase tracking-wider">
                    {tier === '1' ? 'Growth' : tier === '2' ? 'Scale' : tier === '3' ? 'Enterprise' : 'Custom'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Duration</span>
                  <span className="text-foreground font-medium">
                    {months} {parseInt(months || "1") > 1 ? 'Months' : 'Month'}
                  </span>
                </div>
                <div className="pt-2 border-t border-border/30 flex justify-between items-center text-[10px]">
                  <span className="text-teal/70 italic uppercase tracking-tighter">Verified on Blockchain</span>
                  <span className="text-text-muted/50 font-mono">#HELIO-SUCCESS</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={() => router.push("/billing")} 
                  className="w-full bg-teal hover:bg-teal-light text-navy font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Billing
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/")}
                  className="w-full border-border hover:bg-white/5 transition-colors"
                >
                  Go to Overview
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-[10px] uppercase tracking-widest text-text-muted/40 max-w-xs text-center leading-relaxed font-medium"
      >
        Secure transaction powered by Helio Protocol
      </motion.p>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]"><RippleWaveLoader /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
