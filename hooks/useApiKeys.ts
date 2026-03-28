"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string; // e.g., "hrld_live_4xR9..." or "hrld_test_9pQm..."
  environment: "live" | "test";
  scopes: string[]; // e.g., ["send_notifications", "read_analytics"]
  lastUsedAt?: string;
  createdAt: string;
}

// Global mock state for UI dev so mutations update the list without a backend
let MOCK_KEYS: ApiKey[] = [
  { id: "key_1", name: "Production Gateway", prefix: "hrld_live_8xR2...", environment: "live", scopes: ["send_notifications", "read_analytics"], lastUsedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "key_2", name: "Staging Pipeline", prefix: "hrld_test_4aT9...", environment: "test", scopes: ["send_notifications"], lastUsedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export function useApiKeys() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      // Simulate network
      return [...MOCK_KEYS];
    }
  });

  const createKey = useMutation({
    mutationFn: async (data: { name: string; environment: "live" | "test"; scopes: string[] }) => {
      const newKey: ApiKey = {
        id: `key_${Math.random()}`,
        name: data.name,
        environment: data.environment,
        prefix: `hrld_${data.environment}_${Math.random().toString(36).substring(2, 6).toUpperCase()}...`,
        scopes: data.scopes,
        createdAt: new Date().toISOString(),
      };
      MOCK_KEYS.push(newKey);
      
      // Simulate backend returning the raw plaintext key ONE TIME
      return {
        keyInfo: newKey,
        plainTextKey: `hrld_${data.environment}_${Math.random().toString(36).substring(2, 16).toUpperCase()}9xR2A4Q`,
      };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      MOCK_KEYS = MOCK_KEYS.filter(k => k.id !== id);
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
  });

  return { query, createKey, revokeKey };
}
