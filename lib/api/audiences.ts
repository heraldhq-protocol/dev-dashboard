import { apiClient } from "@/lib/api-client";

const BASE = "/campaigns/audiences";

export interface Audience {
  id: string;
  protocolId: string;
  name: string;
  description?: string;
  walletCount: number;
  createdAt: string;
}

export async function listAudiences(): Promise<Audience[]> {
  const { data } = await apiClient.get<Audience[]>(BASE);
  return data;
}

export async function createAudience(data: {
  name: string;
  description?: string;
  wallets: string[];
}): Promise<Audience> {
  const { data: result } = await apiClient.post<Audience>(BASE, data);
  return result;
}

export async function updateAudience(
  id: string,
  data: { name?: string; description?: string; wallets?: string[] },
): Promise<Audience> {
  const { data: result } = await apiClient.patch<Audience>(`${BASE}/${id}`, data);
  return result;
}

export async function deleteAudience(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
