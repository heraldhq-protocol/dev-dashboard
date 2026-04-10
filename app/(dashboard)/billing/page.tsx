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

// Static features per tier for the comparison cards
const TIER_FEATURES: Record<number, string[]> = {
  0: [
    "Community Support",
    "API Access",
    "Standard Latency",
    "1 Webhook Endpoint",
  ],
  1: [
    "Email Support",
    "Advanced Analytics",
    "Reduced Latency",
    "5 Webhook Endpoints",
  ],
  2: [
    "Priority Support",
    "SLA Guarantee",
    "Ultra-low Latency",
    "Unlimited Webhooks",
  ],
  3: [
    "Dedicated Account Manager",
    "Custom SLA",
    "White-glove Onboarding",
    "Unlimited Everything",
  ],
  4: [
    "Dedicated Account Manager",
    "Custom SLA",
    "White-glove Onboarding",
    "Unlimited Everything",
  ],
};

export default function BillingPage() {
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
  });

  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["billingTiers"],
    queryFn: getTiers,
  });

  const { data: paymentData } = useQuery({
    queryKey: ["paymentHistory"],
    queryFn: () => getPaymentHistory(1, 10),
  });

  const checkoutMutation = useMutation({
    mutationFn: (tier: number) => createCheckout(tier),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: () => {
      toast.error("Failed to create checkout session.");
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
  const isLoading = statusLoading || tiersLoading;

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Billing & Usage
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your subscription, view usage, and upgrade your plan.
        </p>
      </div>

      {/* Current Plan Card component */}
      <CurrentPlanCard
        status={status}
        isLoading={statusLoading}
        onUpgradeClick={() => checkoutMutation.mutate(currentTier + 1)}
        onCancelClick={() => cancelMutation.mutate()}
        isCanceling={cancelMutation.isPending}
      />

      {/* Compare Plans */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">
          Compare Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">
          {(tiers.length > 0
            ? tiers
            : [
                { tier: 0, name: "Developer", priceUsdc: 0, limit: 1000 },
                { tier: 1, name: "Growth", priceUsdc: 99, limit: 50000 },
                { tier: 2, name: "Scale", priceUsdc: 299, limit: 500000 },
                {
                  tier: 3,
                  name: "Enterprise",
                  priceUsdc: 999,
                  limit: 10000000,
                },
              ]
          ).map((tier, index, array) => {
            const isCurrent = tier.tier === currentTier;
            
            return (
              <div
                key={tier.tier}
                className={`relative bg-card rounded-2xl p-6 flex flex-col border ${
                  isCurrent
                    ? "border-teal shadow-[0_0_30px_rgba(0,200,150,0.1)]"
                    : "border-border"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-navy px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Current Plan
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <div className="mt-2 flex items-baseline text-3xl font-bold text-foreground">
                    ${tier.priceUsdc}
                    <span className="ml-1 text-sm font-medium text-text-muted">
                      /mo
                    </span>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-border">
                  <span className="text-sm text-text-primary">
                    <span className="font-bold text-foreground">
                      {tier.limit.toLocaleString()}
                    </span>{" "}
                    Notifications
                  </span>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {(TIER_FEATURES[tier.tier] ?? []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 text-teal shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-text-secondary">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? "outline" : "default"}
                  disabled={
                    isCurrent ||
                    tier.tier < currentTier ||
                    checkoutMutation.isPending
                  }
                  onClick={() => checkoutMutation.mutate(tier.tier)}
                  isLoading={checkoutMutation.isPending}
                  className="w-full"
                >
                  {isCurrent
                    ? "Active"
                    : tier.tier < currentTier
                      ? "Downgrade"
                      : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History component */}
      <Separator className="bg-border" />
      
      <OverageManagement />

      <Separator className="bg-border" />

      {paymentData && <PaymentHistory payments={paymentData.payments} />}

      {/* Enterprise CTA */}
      <div className="bg-navy border border-border-2 rounded-xl p-8 text-center mt-12">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Need more volume?
        </h3>
        <p className="text-sm text-text-muted mb-4 max-w-lg mx-auto">
          Contact us for custom enterprise plans with massive notification
          volumes, dedicated IP addresses, and white-glove onboarding.
        </p>
        <Button variant="secondary">Contact Sales</Button>
      </div>
    </div>
  );
}
