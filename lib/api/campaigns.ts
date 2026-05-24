import { apiClient } from "@/lib/api-client";

const BASE = "/campaigns";
const SCHEDULE_BASE = "/v1/schedule";

// ─── Campaign ────────────────────────────────────────────────

export interface Campaign {
  id: string;
  protocolId: string;
  audienceId: string;
  subject: string;
  body: string;
  category: string;
  channels: string[];
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  totalTargets: number;
  totalSent: number;
  totalFailed: number;
  createdAt: string;
  audience?: { name: string; walletCount: number };
}

export async function listCampaigns(): Promise<Campaign[]> {
  const { data } = await apiClient.get<Campaign[]>(BASE);
  return data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.get<Campaign>(`${BASE}/${id}`);
  return data;
}

export async function createCampaign(data: {
  audienceId: string;
  subject: string;
  body: string;
  category?: string;
  channels?: string[];
  scheduledFor?: string;
}): Promise<Campaign> {
  const { data: result } = await apiClient.post<Campaign>(BASE, data);
  return result;
}

export async function updateCampaign(
  id: string,
  data: {
    subject?: string;
    body?: string;
    category?: string;
    channels?: string[];
    scheduledFor?: string | null;
  }
): Promise<Campaign> {
  const { data: result } = await apiClient.patch<Campaign>(`${BASE}/${id}`, data);
  return result;
}

export async function launchCampaign(id: string): Promise<{ launched: boolean }> {
  const { data } = await apiClient.post<{ launched: boolean }>(`${BASE}/${id}/launch`);
  return data;
}

export async function cancelCampaign(id: string): Promise<void> {
  await apiClient.post(`${BASE}/${id}/cancel`);
}

// ─── Scheduled Notifications ─────────────────────────────────

export interface ScheduledNotification {
  id: string;
  protocolId: string;
  wallet?: string;
  subject: string;
  body: string;
  category: string;
  scheduleType: "ONE_TIME" | "RECURRING";
  cronExpr?: string;
  timezone: string;
  nextRunAt: string;
  lastRunAt?: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "CANCELLED" | "FAILED";
  createdAt: string;
}

export async function listScheduledNotifications(
  page?: number
): Promise<{ items: ScheduledNotification[]; total: number }> {
  const { data } = await apiClient.get<{ items: ScheduledNotification[]; total: number }>(
    SCHEDULE_BASE,
    { params: page ? { page } : undefined }
  );
  return data;
}

export async function scheduleOnce(data: {
  wallet?: string;
  subject: string;
  body: string;
  category?: string;
  channels?: string[];
  scheduledFor: string;
  timezone?: string;
}): Promise<ScheduledNotification> {
  const { data: result } = await apiClient.post<ScheduledNotification>(
    `${SCHEDULE_BASE}/once`,
    data
  );
  return result;
}

export async function cancelScheduledNotification(id: string): Promise<void> {
  await apiClient.post(`${SCHEDULE_BASE}/${id}/cancel`);
}
