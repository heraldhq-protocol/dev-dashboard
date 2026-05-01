"use client";

import { Button } from "@/components/ui/Button";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBillingStatus,
  getTiers,
  createCheckout,
  cancelSubscription,
  getPaymentHistory,
} from "@/lib/api/billing";
import { toast } from "sonner";
import { OverageManagement } from "@/components/billing/OverageManagement";
import { Separator } from "@/components/ui/separator";
import { PricingCard } from "@/components/billing/PricingCard";
import { useState, useCallback } from "react";

const TIER_FEATURES: Record<number, string[]> = {
  0: ["Community Support", "API Access", "Standard Latency", "1 Webhook Endpoint"],
  1: ["Email Support", "Advanced Analytics", "Reduced Latency", "5 Webhook Endpoints"],
  2: ["Priority Support", "SLA Guarantee", "Ultra-low Latency", "Unlimited Webhooks"],
  3: ["Dedicated Account Manager", "Custom SLA", "White-glove Onboarding", "Unlimited Everything"],
  4: ["Dedicated Account Manager", "Custom SLA", "White-glove Onboarding", "Unlimited Everything"],
};

const FALLBACK_TIERS = [
  { tier: 0, name: "Developer", priceUsdc: 0, limit: 1000 },
  { tier: 1, name: "Growth", priceUsdc: 99, limit: 50000 },
  { tier: 2, name: "Scale", priceUsdc: 299, limit: 500000 },
  { tier: 3, name: "Enterprise", priceUsdc: 999, limit: 10000000 },
];

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
    staleTime: 60_000,
    placeholderData: (prev: any) => prev,
  });

  const { data: tiers = FALLBACK_TIERS } = useQuery({
    queryKey: ["billingTiers"],
    queryFn: getTiers,
    staleTime: 5 * 60_000,
    placeholderData: FALLBACK_TIERS,
  });

  const { data: paymentData } = useQuery({
    queryKey: ["paymentHistory"],
    queryFn: () => getPaymentHistory(1, 10),
    staleTime: 60_000,
    placeholderData: (prev: any) => prev,
  });

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["billingStatus"] }),
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] }),
      queryClient.invalidateQueries({ queryKey: ["overageStatus"] }),
      queryClient.invalidateQueries({ queryKey: ["overageInvoices"] }),
    ]);
    setLastRefreshed(new Date());
    setIsRefreshing(false);
    toast.success("Billing data refreshed.");
  }, [queryClient]);

  const checkoutMutation = useMutation({
    mutationFn: (tier: number) => createCheckout(tier),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create checkout session.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["billingStatus"] });
    },
    onError: () => {
      toast.error("Failed to cancel subscription.");
    },
  });

  const currentTier = status?.tier ?? 0;
  const displayTiers = tiers.length > 0 ? tiers : FALLBACK_TIERS;

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Billing &amp; Usage
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your subscription, view usage, and upgrade your plan.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-text-muted/60 tabular-nums">
            Refreshed {formatRelativeTime(lastRefreshed)}
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-[11px] font-medium text-teal/80 hover:text-teal transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Current Plan Card */}
      <CurrentPlanCard
        status={status}
        isLoading={statusLoading && !status}
        onUpgradeClick={() => checkoutMutation.mutate(currentTier + 1)}
        onCancelClick={() => cancelMutation.mutate()}
        isCanceling={cancelMutation.isPending}
        isUpgrading={
          checkoutMutation.isPending &&
          checkoutMutation.variables === currentTier + 1
        }
      />

      {/* Compare Plans */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTiers.map((tier) => (
            <PricingCard
              key={tier.tier}
              tier={tier}
              features={TIER_FEATURES[tier.tier] ?? []}
              isCurrent={tier.tier === currentTier}
              isLowerTier={tier.tier < currentTier}
              isPending={
                checkoutMutation.isPending &&
                checkoutMutation.variables === tier.tier
              }
              onAction={(t) => checkoutMutation.mutate(t)}
            />
          ))}
        </div>
      </div>

      {/* Overage Management */}
      <Separator className="bg-border" />
      <OverageManagement />
      <Separator className="bg-border" />

      {/* Payment History */}
      {paymentData && paymentData.payments.length > 0 && (
        <PaymentHistory payments={paymentData.payments} />
      )}
      {paymentData && paymentData.payments.length === 0 && (
        <div className="text-center py-10 rounded-xl border border-dashed border-border">
          <p className="text-sm text-text-muted">No payment history yet.</p>
          <p className="text-xs text-text-muted/50 mt-1">
            Your transactions will appear here after your first payment.
          </p>
        </div>
      )}

      {/* Enterprise CTA */}
      <div className="relative rounded-2xl border border-teal/20 bg-linear-to-br from-navy-2 via-navy to-teal/10 overflow-hidden mt-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
              <svg
                className="w-5 h-5 text-teal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Need more volume?
            </h3>
            <p className="text-sm text-text-muted max-w-xl text-balance">
              Contact us for custom enterprise plans with massive notification
              volumes, dedicated IP addresses, custom SLAs, and white-glove
              onboarding.
            </p>
          </div>
          <Button variant="secondary" className="shrink-0 group">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
