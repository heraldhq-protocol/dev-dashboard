import { apiClient } from "../api-client";
import type {
  BillingStatusDto,
  PaymentDto,
  UsageStatsDto,
  TierInfo,
  OverageStatusResponse,
  OverageSettingsDto,
  OverageInvoiceDto,
} from "@/types/api";

const BASE = "/billing";

export async function getBillingStatus(): Promise<BillingStatusDto> {
  const { data } = await apiClient.get<BillingStatusDto>(`${BASE}/status`);
  return data;
}

export async function getTiers(): Promise<TierInfo[]> {
  const { data } = await apiClient.get<TierInfo[]>(`${BASE}/tiers`);
  return data;
}

export async function getUsageStats(): Promise<UsageStatsDto> {
  const { data } = await apiClient.get<UsageStatsDto>(`${BASE}/usage`);
  return data;
}

export async function createCheckout(
  tier: number,
  months = 1
): Promise<{ checkoutUrl: string; transactionId: string }> {
  try {
    const { data } = await apiClient.post(`${BASE}/checkout`, { tier, months });
    return data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to manage billing');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid checkout request');
    }
    throw new Error('Failed to create checkout session');
  }
}

export async function cancelSubscription(): Promise<{ message: string }> {
  const { data } = await apiClient.post(`${BASE}/cancel`);
  return data;
}

export async function getPaymentHistory(
  page = 1,
  limit = 50
): Promise<{ payments: PaymentDto[]; total: number; page: number; limit: number }> {
  const { data } = await apiClient.get(`${BASE}/payments`, {
    params: { page, limit },
  });
  return data;
}

export async function getOverageStatus(): Promise<OverageStatusResponse> {
  const { data } = await apiClient.get<OverageStatusResponse>(`${BASE}/overage/settings`);
  return data;
}

export async function updateOverageSettings(
  settings: Partial<OverageSettingsDto>
): Promise<OverageSettingsDto> {
  const { data } = await apiClient.patch<OverageSettingsDto>(`${BASE}/overage/settings`, settings);
  return data;
}

export async function getOverageInvoices(): Promise<OverageInvoiceDto[]> {
  const { data } = await apiClient.get<OverageInvoiceDto[]>(`${BASE}/overage/invoices`);
  return data;
}

export async function syncDevTier(tier: number): Promise<{ ok: boolean }> {
  const { data } = await apiClient.post(`${BASE}/dev-sync`, { tier });
  return data;
}