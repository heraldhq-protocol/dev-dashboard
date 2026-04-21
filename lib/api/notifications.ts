import { apiClient, getNotificationApiClient, getNotificationGatewayUrl } from "../api-client";
import { TestSendDto, TestSendResult, PaginatedNotifications } from "@/types/api";

const BASE = "/notifications";

export interface PlaygroundApiKey {
  id: string;
  key: string;
  keyPrefix: string;
  environment: string;
  name: string;
}

export interface PreviewResult {
  renderedHtml?: string;
  telegramText?: string;
  smsText?: string;
}

export async function getPlaygroundApiKey(): Promise<PlaygroundApiKey | null> {
  try {
    const { data } = await apiClient.get<PlaygroundApiKey>("/api-keys/playground");
    return data;
  } catch (error) {
    console.error("Failed to fetch playground API key:", error);
    return null;
  }
}

export async function previewNotification(
  dto: TestSendDto,
  apiKey: string,
  channel: "email" | "telegram" | "sms"
): Promise<PreviewResult> {
  if (!apiKey) {
    throw new Error(
      "No API key available. Please refresh the page.",
    );
  }

  const notificationClient = getNotificationApiClient(apiKey);
  const gatewayUrl = getNotificationGatewayUrl();

  const { data } = await notificationClient.post<PreviewResult>(
    `${gatewayUrl}/v1/preview`,
    {
      wallet: dto.walletAddress,
      subject: dto.subject,
      body: dto.body,
      category: dto.category,
      preferred_channel: channel,
    },
  );

  return data;
}

export async function testSend(dto: TestSendDto, apiKey: string, channel?: "email" | "telegram" | "sms"): Promise<TestSendResult> {
  if (!apiKey) {
    throw new Error(
      "No API key available. Please refresh the page.",
    );
  }

  const notificationClient = getNotificationApiClient(apiKey);
  const gatewayUrl = getNotificationGatewayUrl();

  const payload: Record<string, unknown> = {
    wallet: dto.walletAddress,
    subject: dto.subject,
    body: dto.body,
    category: dto.category,
  };

  if (channel) {
    payload.preferred_channel = channel;
  }

  const { data } = await notificationClient.post<TestSendResult>(
    `${gatewayUrl}/v1/notify`,
    payload,
  );

  return data;
}

export async function listNotifications(
  page = 1,
  limit = 20,
  status?: string,
  category?: string,
  search?: string
): Promise<PaginatedNotifications> {
  const { data } = await apiClient.get<PaginatedNotifications>(BASE, {
    params: { page, limit, status, category, search },
  });
  return data;
}