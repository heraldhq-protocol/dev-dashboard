"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";

interface UseApiReturn {
  axios: typeof apiClient;
}

const ApiContext = createContext<UseApiReturn>({ axios: apiClient });

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <ApiContext.Provider value={{ axios: apiClient }}>{children}</ApiContext.Provider>
    </QueryClientProvider>
  );
}

export function useApi(): UseApiReturn {
  return useContext(ApiContext);
}
