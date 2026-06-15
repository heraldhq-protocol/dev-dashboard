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

export async function reregisterCustomWebhook(): Promise<{ success: boolean; webhookUrl: string; error?: string }> {
  const { data } = await apiClient.post<{ success: boolean; webhookUrl: string; error?: string }>(
    "/portal/channels/telegram/reregister-custom-webhook"
  );
  return data;
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

export interface GroupConnectResponse {
  nonce: string;
  connectUrl: string;
  expiresIn: number;
}

export async function getGroupConnectLink(): Promise<GroupConnectResponse> {
  const { data } = await apiClient.get<GroupConnectResponse>(
    "/portal/channels/telegram/group-connect"
  );
  return data;
}

export async function pollGroupConnectStatus(
  nonce: string
): Promise<{ status: "pending" | "completed" | "expired"; chatId?: string }> {
  const { data } = await apiClient.get<{
    status: "pending" | "completed" | "expired";
    chatId?: string;
  }>("/portal/channels/telegram/group-poll", { params: { nonce } });
  return data;
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

// ── Group preferences (auto-pin, welcome message, member count) ──────────────

export interface GroupPreferences {
  autoPinEnabled: boolean;
  welcomeMessage: string | null;
  groupMemberCount: number | null;
  memberCountAt: string | null;
}

export async function getGroupPreferences(): Promise<GroupPreferences> {
  const { data } = await apiClient.get<GroupPreferences>(
    "/portal/channels/telegram/preferences"
  );
  return data;
}

export async function saveGroupPreferences(prefs: {
  autoPinEnabled?: boolean;
  welcomeMessage?: string | null;
}): Promise<{ saved: boolean }> {
  const { data } = await apiClient.put<{ saved: boolean }>(
    "/portal/channels/telegram/preferences",
    prefs
  );
  return data;
}

// ── Custom bot profile sync ──────────────────────────────────────────────────

export async function syncBotProfile(profile: {
  name?: string;
  description?: string;
}): Promise<{ synced: boolean }> {
  const { data } = await apiClient.post<{ synced: boolean }>(
    "/portal/channels/telegram/sync-profile",
    profile
  );
  return data;
}

// ── Forum topic auto-creation ────────────────────────────────────────────────

export async function createForumTopics(
  categories: string[]
): Promise<{ threads: Record<string, string> }> {
  const { data } = await apiClient.post<{ threads: Record<string, string> }>(
    "/portal/channels/telegram/create-topics",
    { categories }
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
