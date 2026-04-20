import { apiClient, getNotificationApiClient, getNotificationGatewayUrl } from "../api-client";
import { TestSendDto, TestSendResult, PaginatedNotifications } from "@/types/api";

const BASE = "/notifications";

export interface ApiKeyInfo {
  id: string;
  key: string;
  keyPrefix: string;
  environment: string;
  name: string;
  isRevoked: boolean;
}

export async function getApiKeys(): Promise<ApiKeyInfo[]> {
  const { data } = await apiClient.get<{ items: ApiKeyInfo[] }>("/api-keys/me");
  return data.items?.filter((k) => !k.isRevoked) || [];
}

export async function testSend(dto: TestSendDto, apiKey: string): Promise<TestSendResult> {
  if (!apiKey) {
    throw new Error(
      "No API key selected. Please create or select an API key in Settings > API Keys.",
    );
  }

  const notificationClient = getNotificationApiClient(apiKey);
  const gatewayUrl = getNotificationGatewayUrl();

  const { data } = await notificationClient.post<TestSendResult>(
    `${gatewayUrl}/v1/notify`,
    {
      wallet: dto.walletAddress,
      subject: dto.subject,
      body: dto.body,
      category: dto.category,
      preferred_channel: "email",
    },
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