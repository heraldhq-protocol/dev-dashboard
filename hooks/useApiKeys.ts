"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiKeys, createApiKey, revokeApiKey } from "@/lib/api/keys";
import type { ApiKey } from "@/types/api";

export type DashboardApiKey = Omit<ApiKey, "environment"> & {
  environment: "live" | "test";
};

export type { ApiKey };


// Mapping between UI-friendly names and Backend names
const ENV_MAP = {
  live: "production",
  test: "sandbox",
} as const;

const REVERSE_ENV_MAP: Record<string, "live" | "test"> = {
  production: "live",
  sandbox: "test",
};

export function useApiKeys() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async (): Promise<DashboardApiKey[]> => {
      const keys = await getApiKeys();
      return keys.map((k) => ({
        ...k,
        environment: REVERSE_ENV_MAP[k.environment] || "test",
      }));
    },
  });

  const createKey = useMutation({
    mutationFn: async (data: {
      name: string;
      environment: "live" | "test";
      scopes: string[];
    }) => {
      const response = await createApiKey({
        name: data.name,
        environment: ENV_MAP[data.environment],
        scopes: data.scopes,
      });

      return {
        keyInfo: {
          ...response,
          environment: REVERSE_ENV_MAP[response.environment] || "test",
        },
        plainTextKey: response.plainText,
      };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      await revokeApiKey(id);
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
  });

  return { query, createKey, revokeKey };
}

