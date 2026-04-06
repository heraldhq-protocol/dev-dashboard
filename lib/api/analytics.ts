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

export interface NotificationTrends {
  statusBreakdown: { status: string; _count: { id: number } }[];
  categoryBreakdown: { category: string; _count: { id: number } }[];
  timeframeDays: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/analytics/dashboard");
  return data;
}

export async function getNotificationTrends(days = 7): Promise<NotificationTrends> {
  const { data } = await apiClient.get<NotificationTrends>("/analytics/trends", {
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
