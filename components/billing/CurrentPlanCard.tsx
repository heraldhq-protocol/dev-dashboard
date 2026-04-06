"use client";

import { BillingStatusDto } from "@/types/api";
import { Button } from "@/components/ui/Button";

interface CurrentPlanCardProps {
  status?: BillingStatusDto;
  isLoading: boolean;
  onUpgradeClick?: () => void;
  onCancelClick?: () => void;
  isCanceling?: boolean;
}

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
};

export function CurrentPlanCard({
  status,
  isLoading,
  onUpgradeClick,
  onCancelClick,
  isCanceling,
}: CurrentPlanCardProps) {
  const currentTier = status?.tier ?? 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 flex flex-col md:flex-row gap-8 shadow-xl">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
            Current Plan
          </h2>
          <div className="flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-9 w-32 bg-card-2 animate-pulse rounded-lg" />
            ) : (
              <>
                <h3 className="text-3xl font-bold text-foreground">
                  {status?.tierName ?? "Developer (Free)"}
                </h3>
                {status?.status === "active" && (
                  <span className="text-teal font-medium bg-teal/10 px-2.5 py-1 rounded-lg text-sm border border-teal/20">
                    Active
                  </span>
                )}
                {status?.cancelAtPeriodEnd && (
                  <span className="text-gold font-medium bg-gold/10 px-2.5 py-1 rounded-lg text-sm border border-gold/20">
                    Cancels at period end
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Usage progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Notification Usage</span>
            {isLoading ? (
              <div className="h-4 w-20 bg-card-2 animate-pulse rounded" />
            ) : (
              <span className="text-foreground font-semibold">
                {status?.sendsThisPeriod.toLocaleString() ?? 0}{" "}
                <span className="text-text-muted font-normal">
                  / {status?.sendsLimit.toLocaleString() ?? 0}
                </span>
              </span>
            )}
          </div>
          <div className="h-2.5 bg-card-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(status?.usagePercent ?? 0, 100)}%`,
                background:
                  (status?.usagePercent ?? 0) > 90
                    ? "linear-gradient(90deg, #E8920A, #D63031)"
                    : "linear-gradient(90deg, #00C896, #00E5A8)",
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{(status?.usagePercent ?? 0).toFixed(1)}% used</span>
            {status?.periodResetAt && (
              <span>
                Resets{" "}
                {new Date(status.periodResetAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Remaining + Days */}
        {!isLoading && status && (
          <div className="flex gap-6 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">
                Remaining
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {Math.max(
                  0,
                  (status.sendsLimit ?? 0) - (status.sendsThisPeriod ?? 0)
                ).toLocaleString()}
              </p>
            </div>
            {status.daysRemaining > 0 && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Days Left
                </p>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {status.daysRemaining}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right column — actions */}
      <div className="flex flex-col items-start md:items-end justify-between md:border-l border-border md:pl-8">
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Plan Includes
          </h4>
          <ul className="text-sm text-text-secondary space-y-2">
            {(TIER_FEATURES[currentTier] ?? TIER_FEATURES[0]).map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          {currentTier < 3 && (
            <Button
              onClick={onUpgradeClick}
              className="w-full md:w-auto shadow-[0_0_20px_rgba(0,200,150,0.2)]"
            >
              Upgrade Plan
            </Button>
          )}
          {status?.status === "active" &&
            !status?.cancelAtPeriodEnd &&
            currentTier > 0 &&
            onCancelClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelClick}
                isLoading={isCanceling}
                className="text-text-muted hover:text-red mt-2"
              >
                Cancel Subscription
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
