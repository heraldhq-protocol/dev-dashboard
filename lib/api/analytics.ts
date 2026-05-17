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

export interface AudienceAnalytics {
  totalRegistered: number;
  activeLastThirtyDays: number;
  retentionRate: number;
  channelCoverage: { email: number; telegram: number; sms: number };
  registrationTrend: { date: string; count: number }[];
}

export async function getAudienceAnalytics(): Promise<AudienceAnalytics> {
  const { data } = await apiClient.get<AudienceAnalytics>("/analytics/audience");
  return data;
}

export interface EngagementMetrics {
  totalSends: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  period: { from: string; to: string };
}

export async function getEngagementMetrics(params?: {
  startDate?: string;
  endDate?: string;
  templateId?: string;
}): Promise<EngagementMetrics> {
  const { data } = await apiClient.get<EngagementMetrics>("/analytics/engagement", { params });
  return data;
}
