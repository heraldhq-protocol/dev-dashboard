"use client";

import { useQuery } from "@tanstack/react-query";
// import { apiClient } from "@/lib/api-client";

export interface AnalyticsSummary {
  totalSends: number;
  deliveryRate: number;
  failedCount: number;
  processingCount: number;
  // Mapped by day/week
  volumeOverTime: Array<{ date: string; sends: number }>;
}

export function useAnalytics(dateRange: "7d" | "30d" | "90d" | "custom" = "30d") {
  return useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: async (): Promise<AnalyticsSummary> => {
      // return (await apiClient.get<AnalyticsSummary>(`/v1/analytics?range=${dateRange}`)).data;
      
      // MOCK DATA FOR UI DEVELOPMENT
      return {
        totalSends: 19450,
        deliveryRate: 85,
        failedCount: 10,
        processingCount: 5,
        volumeOverTime: []
      };
    },
    refetchInterval: 60000, // 60s
  });
}
