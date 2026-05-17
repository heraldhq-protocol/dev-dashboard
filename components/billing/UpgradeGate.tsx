"use client";

import { usePlanGate } from "@/hooks/usePlanGate";
import { TierGatePage } from "@/components/shared/TierGatePage";

const TIER_NAMES: Record<number, string> = {
  0: "Developer",
  1: "Growth",
  2: "Scale",
  3: "Enterprise",
};

interface UpgradeGateProps {
  /** Minimum tier required (1=Growth, 2=Scale, 3=Enterprise) */
  minTier: number;
  /** Feature name shown in the upgrade prompt */
  feature: string;
  description?: string;
  children: React.ReactNode;
}

export function UpgradeGate({ minTier, feature, description, children }: UpgradeGateProps) {
  const { tier, isLoading } = usePlanGate();

  if (isLoading) return null;
  if (tier >= minTier) return <>{children}</>;

  return (
    <TierGatePage
      feature={feature}
      description={description ?? `Upgrade to unlock ${feature} and other advanced features.`}
      currentTierName={TIER_NAMES[tier] ?? "Developer"}
      requiredTier={TIER_NAMES[minTier] ?? "Growth"}
    />
  );
}
