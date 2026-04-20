import { apiClient } from "@/lib/api-client";
import type {
  ProtocolProfileDto,
  UpdateProtocolDto,
  RegisterProtocolDto,
  RegisterProtocolResponse,
  ProtocolStatusDto,
} from "@/types/api";

const BASE = "/protocols";

export async function getProtocol(): Promise<ProtocolProfileDto> {
  const { data } = await apiClient.get<ProtocolProfileDto>(`${BASE}/me`);
  return data;
}

export async function updateProtocol(
  dto: UpdateProtocolDto
): Promise<ProtocolProfileDto> {
  const payload = {
    protocolName: dto.protocolName,
    website: dto.website,
    logoUrl: dto.logoUrl,
    customFromName: dto.customFromName,
    notificationCategories: dto.notificationCategories,
  };
  const { data } = await apiClient.patch<ProtocolProfileDto>(
    `${BASE}/me`,
    payload
  );
  return data;
}

export async function getProtocolStatus(): Promise<ProtocolStatusDto> {
  const { data } = await apiClient.get<ProtocolStatusDto>(`${BASE}/me/status`);
  return data;
}

export async function deactivateProtocol(): Promise<void> {
  await apiClient.delete(`${BASE}/me`);
}

export async function registerProtocol(
  dto: RegisterProtocolDto
): Promise<RegisterProtocolResponse> {
  const { data } = await apiClient.post<RegisterProtocolResponse>(
    `${BASE}/register`,
    dto
  );
  return data;
}

export interface SandboxSettings {
  testEmail?: string | null;
  testTelegramId?: string | null;
  testPhone?: string | null;
}

export async function getSandboxSettings(): Promise<SandboxSettings> {
  const { data } = await apiClient.get<SandboxSettings>(`${BASE}/me/sandbox`);
  return data;
}

export async function updateSandboxSettings(
  dto: SandboxSettings
): Promise<SandboxSettings> {
  const { data } = await apiClient.patch<SandboxSettings>(
    `${BASE}/me/sandbox`,
    dto
  );
  return data;
}

export interface ProtocolAsset {
  id: string;
  assetType: "banner" | "video" | "logo";
  url: string;
  isActive: boolean;
  createdAt: string;
}

export async function getProtocolAssets(): Promise<ProtocolAsset[]> {
  const { data } = await apiClient.get<ProtocolAsset[]>(`${BASE}/me/assets`);
  return data;
}

export async function createProtocolAsset(
  dto: Pick<ProtocolAsset, "assetType" | "url"> & { isActive?: boolean }
): Promise<ProtocolAsset> {
  const { data } = await apiClient.post<ProtocolAsset>(
    `${BASE}/me/assets`,
    dto
  );
  return data;
}

export async function updateProtocolAsset(
  assetId: string,
  dto: Partial<Pick<ProtocolAsset, "url" | "isActive">>
): Promise<ProtocolAsset> {
  const { data } = await apiClient.patch<ProtocolAsset>(
    `${BASE}/me/assets/${assetId}`,
    dto
  );
  return data;
}

export async function deleteProtocolAsset(assetId: string): Promise<void> {
  await apiClient.delete(`${BASE}/me/assets/${assetId}`);
}
