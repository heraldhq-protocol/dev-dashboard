"use client";

import { useQuery } from "@tanstack/react-query";
import { getBillingStatus } from "@/lib/api/billing";

export function usePlanGate() {
  const { data: status, isLoading } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
    staleTime: 60_000,
  });

  const tier = status?.tier ?? 0;

  return {
    tier,
    isLoading,
    /** Returns true if current plan meets the minimum tier requirement */
    hasFeature: (minTier: number) => tier >= minTier,
  };
}
