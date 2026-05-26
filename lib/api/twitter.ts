import { apiClient } from "@/lib/api-client";

const BASE = "/twitter";

export interface XStatus {
  connected: boolean;
  xUsername?: string;
  xVerified?: boolean;
  xConnectedAt?: string;
  isActive: boolean;
}

export async function getTwitterAuthUrl(): Promise<{ authUrl: string }> {
  const { data } = await apiClient.get<{ authUrl: string }>(`${BASE}/auth-url`);
  return data;
}

export async function handleTwitterCallback(
  code: string,
  state: string
): Promise<XStatus> {
  const { data } = await apiClient.post<XStatus>(`${BASE}/callback`, {
    code,
    state,
  });
  return data;
}

export async function getTwitterStatus(): Promise<XStatus> {
  const { data } = await apiClient.get<XStatus>(`${BASE}/status`);
  return data;
}

export async function disconnectTwitter(): Promise<void> {
  await apiClient.delete(`${BASE}/disconnect`);
}
