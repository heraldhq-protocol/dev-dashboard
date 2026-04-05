"use client";

import { useState } from "react";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { BillingPlanDto } from "@/types/api";
import { Button } from "@/components/ui/Button";

// Mock Data
const MOCK_PLAN: BillingPlanDto = {
  tier: 0,
  name: "Developer",
  monthlyPrice: 0,
  sendLimit: 5000,
  currentUsage: 3950,
  nextBillingDate: new Date(Date.now() + 15 * 86400000).toISOString(),
};

const TIERS = [
  {
    level: 0,
    name: "Developer",
    price: "$0",
    sends: "5,000",
    features: [
      "Community Support",
      "API Access",
      "Standard Latency",
      "1 Webhook Endpoint",
    ],
  },
  {
    level: 1,
    name: "Growth",
    price: "$49",
    sends: "50,000",
    features: [
      "Email Support",
      "Advanced Analytics",
      "Reduced Latency",
      "5 Webhook Endpoints",
    ],
  },
  {
    level: 2,
    name: "Scale",
    price: "$199",
    sends: "250,000",
    features: [
      "Priority Support",
      "SLA Guarantee",
      "Ultra-low Latency",
      "Unlimited Webhooks",
    ],
  },
];

export default function BillingPage() {
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = () => {
    setUpgrading(true);
    // In real app, this would redirect to a Stripe Checkout session
    setTimeout(() => {
      alert("Redirecting to Checkout...");
      setUpgrading(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Billing & Usage
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your subscription, view usage, and upgrade your plan.
        </p>
      </div>

      <CurrentPlanCard plan={MOCK_PLAN} onUpgradeClick={handleUpgrade} />

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = tier.level === MOCK_PLAN.tier;
            return (
              <div
                key={tier.level}
                className={`relative bg-card rounded-2xl p-6 flex flex-col border ${
                  isCurrent
                    ? "border-teal shadow-[0_0_30px_rgba(0,200,150,0.1)]"
                    : "border-border"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-navy px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Current Plan
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {tier.name}
                  </h3>
                  <div className="mt-2 flex items-baseline text-3xl font-bold text-white">
                    {tier.price}
                    <span className="ml-1 text-sm font-medium text-text-muted">
                      /mo
                    </span>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-border">
                  <span className="text-sm text-text-primary">
                    <span className="font-bold text-white">{tier.sends}</span>{" "}
                    Notifications
                  </span>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
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
                  disabled={isCurrent || upgrading}
                  onClick={handleUpgrade}
                  className="w-full"
                >
                  {isCurrent ? "Active" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="bg-navy border border-border-2 rounded-xl p-8 text-center mt-12">
        <h3 className="text-lg font-bold text-white mb-2">Need more volume?</h3>
        <p className="text-sm text-text-muted mb-4 max-w-lg mx-auto">
          Contact us for custom enterprise plans with massive notification
          volumes, dedicated IP addresses, and white-glove onboarding.
        </p>
        <Button variant="secondary">Contact Sales</Button>
      </div>
    </div>
  );
}
