"use client";

import { BillingPlanDto } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { UsageProgressBar } from "./UsageProgressBar";
import { format } from "date-fns";

interface CurrentPlanCardProps {
  plan: BillingPlanDto;
  onUpgradeClick?: () => void;
}

export function CurrentPlanCard({ plan, onUpgradeClick }: CurrentPlanCardProps) {
  const isFree = plan.tier === 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 flex flex-col md:flex-row gap-8 shadow-xl">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Current Plan</h2>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
            {!isFree && (
              <span className="text-teal font-medium bg-teal/10 px-2.5 py-1 rounded-lg text-sm border border-teal/20">
                Active
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            ${plan.monthlyPrice} <span className="text-text-muted text-sm font-normal">/ month</span>
          </div>
          <p className="text-sm text-text-secondary">
            Next billing date: <span className="text-white font-medium">{format(new Date(plan.nextBillingDate), "MMM d, yyyy")}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <UsageProgressBar used={plan.currentUsage} quota={plan.sendLimit} />
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end justify-between md:border-l border-border md:pl-8">
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Plan Includes
          </h4>
          <ul className="text-sm text-text-secondary space-y-2">
            <li>• {plan.sendLimit.toLocaleString()} Sends / month</li>
            <li>• Multi-channel delivery</li>
            <li>• Standard Support</li>
            {plan.tier > 0 && <li>• Real-time Webhooks</li>}
            {plan.tier > 1 && <li>• Advanced Analytics</li>}
          </ul>
        </div>
        
        {plan.tier < 3 && (
          <Button variant="primary" onClick={onUpgradeClick} className="w-full md:w-auto shadow-[0_0_20px_rgba(0,200,150,0.2)]">
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
}
