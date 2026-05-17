import { apiClient } from "@/lib/api-client";

const BASE = "/templates";

export interface StarterTemplateResponse {
  html: string;
  suggestedVariables: {
    logoUrl: string | null;
    brandName: string | null;
    protocolName: string | null;
  };
}

export async function getStarterTemplate(): Promise<StarterTemplateResponse> {
  const { data } = await apiClient.get<StarterTemplateResponse>(
    `${BASE}/starter`
  );
  return data;
}

export async function promoteTemplate(
  id: string
): Promise<{ success: boolean; templateId: string }> {
  const { data } = await apiClient.post(`${BASE}/${id}/promote`);
  return data;
}

export interface MarketplaceTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  useCaseTag: string;
  emailSubject: string;
  emailHtml?: string;
  smsText?: string;
  telegramText?: string;
  variables: { name: string; description: string; example: string }[];
  previewImageUrl: string | null;
  isOfficial: boolean;
  usageCount: number;
}

export async function listMarketplaceTemplates(category?: string): Promise<MarketplaceTemplate[]> {
  const { data } = await apiClient.get<MarketplaceTemplate[]>(`${BASE}/marketplace`, {
    params: category ? { category } : undefined,
  });
  return data;
}

export async function getMarketplaceTemplate(slug: string): Promise<MarketplaceTemplate> {
  const { data } = await apiClient.get<MarketplaceTemplate>(`${BASE}/marketplace/${slug}`);
  return data;
}

export async function importMarketplaceTemplate(
  slug: string,
  name?: string,
): Promise<{ success: boolean; templateId: string }> {
  const { data } = await apiClient.post(`${BASE}/marketplace/${slug}/import`, { name });
  return data;
}
