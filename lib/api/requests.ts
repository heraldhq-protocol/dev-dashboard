import { apiClient } from "@/lib/api-client";

export interface RequestLogItem {
  id: string;
  apiKeyId: string | null;
  isTestKey: boolean;
  method: string;
  endpoint: string;
  requestBody: unknown;
  responseBody: unknown;
  statusCode: number;
  latencyMs: number;
  correlationId: string | null;
  createdAt: string;
}

export interface RequestLogFilters {
  page?: number;
  limit?: number;
  statusCode?: number;
  endpoint?: string;
  isTestKey?: boolean;
}

export interface RequestLogPage {
  items: RequestLogItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getRequestLogs(filters: RequestLogFilters = {}): Promise<RequestLogPage> {
  const params: Record<string, string> = {
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 50),
  };
  if (filters.statusCode !== undefined) params.statusCode = String(filters.statusCode);
  if (filters.endpoint) params.endpoint = filters.endpoint;
  if (filters.isTestKey !== undefined) params.isTestKey = String(filters.isTestKey);

  const { data } = await apiClient.get<RequestLogPage>("/analytics/requests", { params });
  return data;
}
