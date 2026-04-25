"use client";

import * as React from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: {
    tier: number;
    name: string;
    priceUsdc: number;
    limit: number;
  };
  features: string[];
  isCurrent: boolean;
  isLowerTier: boolean;
  isPending: boolean;
  onAction: (tier: number) => void;
}

export function PricingCard({
  tier,
  features,
  isCurrent,
  isLowerTier,
  isPending,
  onAction,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border p-6 transition-all duration-300",
        isCurrent
          ? "border-teal bg-linear-to-b from-teal/10 to-bg-card shadow-[0_0_30px_rgba(0,200,150,0.15)] scale-105 z-10"
          : "border-border bg-card hover:border-border-alt hover:bg-card-2/50"
      )}
    >
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <Badge 
            variant={isCurrent ? "default" : "secondary"}
            className={isCurrent ? "bg-teal text-navy" : ""}
          >
            {tier.name}
          </Badge>
        </div>
        
        <h4 className="mb-1 mt-4 text-3xl font-bold text-foreground">
          ${tier.priceUsdc}
          <span className="text-sm font-medium text-text-muted">/mo</span>
        </h4>
        
        <p className="text-sm text-text-muted">
          <span className="font-bold text-foreground">
            {tier.limit.toLocaleString()}
          </span>{" "}
          Notifications
        </p>
      </div>

      <div className="my-6 border-t border-border" />

      {/* Features List */}
      <ul className="flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-text-secondary">
            <CircleCheck className="mr-2 h-4 w-4 text-teal shrink-0" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <div className="mt-auto pt-6">
        <Button
          size="sm"
          className="w-full"
          variant={isCurrent ? "outline" : "default"}
          disabled={isCurrent || isLowerTier || isPending}
          onClick={() => onAction(tier.tier)}
          isLoading={isPending}
        >
          {isCurrent ? "Active" : isLowerTier ? "Downgrade" : "Upgrade"}
        </Button>
      </div>
    </div>
  );
}