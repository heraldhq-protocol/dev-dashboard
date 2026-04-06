import { apiClient } from "@/lib/api-client";
import type { ApiKey } from "@/types/api";

const BASE = "/api-keys";

export interface CreateApiKeyDto {
  name: string;
  environment: "production" | "sandbox";
  scopes?: string[];
}

export interface CreateApiKeyResponse extends ApiKey {
  plainText: string;
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const { data } = await apiClient.get<ApiKey[]>(BASE);
  return data;
}

export async function createApiKey(dto: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
  const { data } = await apiClient.post<CreateApiKeyResponse>(BASE, dto);
  return data;
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
