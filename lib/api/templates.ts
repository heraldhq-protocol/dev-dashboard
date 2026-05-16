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
