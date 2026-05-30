import { apiClient } from "@/lib/api-client";

// ── Bot token ────────────────────────────────────────────────────────────────

export interface BotTokenStatus {
  configured: boolean;
  username?: string;
}

export async function getBotTokenStatus(): Promise<BotTokenStatus> {
  const { data } = await apiClient.get<BotTokenStatus>(
    "/portal/channels/telegram/bot-token"
  );
  return data;
}

export async function saveBotToken(token: string): Promise<{ username: string }> {
  const { data } = await apiClient.post<{ username: string }>(
    "/portal/channels/telegram/bot-token",
    { token }
  );
  return data;
}

export async function removeBotToken(): Promise<void> {
  await apiClient.delete("/portal/channels/telegram/bot-token");
}

// ── Group chat ───────────────────────────────────────────────────────────────

export interface GroupChatStatus {
  groupChatId: string | null;
}

export async function getGroupChatId(): Promise<GroupChatStatus> {
  const { data } = await apiClient.get<GroupChatStatus>(
    "/portal/channels/telegram/group-chat"
  );
  return data;
}

export async function saveGroupChatId(
  groupChatId: string
): Promise<{ saved: boolean }> {
  const { data } = await apiClient.put<{ saved: boolean }>(
    "/portal/channels/telegram/group-chat",
    { groupChatId }
  );
  return data;
}

export async function removeGroupChatId(): Promise<void> {
  await apiClient.delete("/portal/channels/telegram/group-chat");
}

// ── Topic thread routing ─────────────────────────────────────────────────────

export interface ThreadIds {
  threads: Record<string, string> | null;
}

export async function getThreadIds(): Promise<ThreadIds> {
  const { data } = await apiClient.get<ThreadIds>(
    "/portal/channels/telegram/threads"
  );
  return data;
}

export async function saveThreadIds(
  threads: Record<string, string>
): Promise<{ saved: boolean }> {
  const { data } = await apiClient.put<{ saved: boolean }>(
    "/portal/channels/telegram/threads",
    { threads }
  );
  return data;
}

// ── Test message ─────────────────────────────────────────────────────────────

export async function sendTestMessage(
  chatId: string
): Promise<{ messageId: string }> {
  const { data } = await apiClient.post<{ messageId: string }>(
    "/portal/channels/telegram/test",
    { chatId }
  );
  return data;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface TelegramAnalytics {
  period: string;
  subscribers: number;
  deliveries: { sent: number; delivered: number; failed: number };
  deliveryRate: number;
  clicks: number;
  clickRate: number;
  topLinks: { url: string | null; clicks: number }[];
}

export async function getTelegramAnalytics(
  period: "7d" | "30d" | "90d" = "30d"
): Promise<TelegramAnalytics> {
  const { data } = await apiClient.get<TelegramAnalytics>(
    "/analytics/telegram",
    { params: { period } }
  );
  return data;
}
