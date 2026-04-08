import { apiClient } from "@/lib/api-client";
import type { NotificationDto } from "@/types/api";

export interface DashboardStats {
  sendsThisPeriod: number;
  activeApiKeys: number;
  activeWebhooks: number;
  deliverySuccessRate: number;
  recentNotifications: number;
  averageLatencyMs: number;
  queryTime: string;
}

export interface AnalyticsTrends {
  statusBreakdown: { status: string; _count: { id: number } }[];
  categoryBreakdown: { category: string; _count: { id: number } }[];
  timeframeDays: number;
  totalVolume: number;
  dailyVolume: { date: string; volume: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/analytics/dashboard");
  return data;
}

export async function getAnalyticsTrends(days = 7): Promise<AnalyticsTrends> {
  const { data } = await apiClient.get<AnalyticsTrends>("/analytics/trends", {
    params: { days },
  });
  return data;
}

export async function getRecentNotifications(
  limit = 20
): Promise<NotificationDto[]> {
  const { data } = await apiClient.get<NotificationDto[]>("/notifications", {
    params: { limit, status: "failed" },
  });
  return data;
}
