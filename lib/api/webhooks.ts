import { apiClient } from "@/lib/api-client";
import type {
  WebhookDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookDelivery,
} from "@/types/api";

const BASE = "/webhooks";

export async function listWebhooks(): Promise<WebhookDto[]> {
  const { data } = await apiClient.get<WebhookDto[]>(BASE);
  return data;
}

export async function createWebhook(
  dto: CreateWebhookDto
): Promise<WebhookDto & { secret: string }> {
  const { data } = await apiClient.post<WebhookDto & { secret: string }>(
    BASE,
    dto
  );
  return data;
}

export async function updateWebhook(
  id: string,
  dto: UpdateWebhookDto
): Promise<{ updated: boolean }> {
  const { data } = await apiClient.patch(`${BASE}/${id}`, dto);
  return data;
}

export async function deleteWebhook(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function testWebhook(
  id: string
): Promise<{ status: number; success: boolean; error?: string }> {
  const { data } = await apiClient.post(`${BASE}/${id}/test`);
  return data;
}

export async function getDeliveryLogs(
  id: string,
  limit = 50
): Promise<WebhookDelivery[]> {
  const { data } = await apiClient.get<WebhookDelivery[]>(
    `${BASE}/${id}/deliveries`,
    { params: { limit } }
  );
  return data;
}
