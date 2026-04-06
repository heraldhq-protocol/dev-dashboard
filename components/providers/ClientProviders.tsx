"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SolanaCluster } from "@herald-protocol/sdk";

import "@solana/wallet-adapter-react-ui/styles.css";

const CLUSTER = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "localnet") as SolanaCluster;

const RPC_ENDPOINTS: Record<SolanaCluster, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  localnet: "http://localhost:8899",
};

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  RPC_ENDPOINTS[CLUSTER] ||
  RPC_ENDPOINTS["mainnet-beta"];

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
          mutations: { retry: 0 },
        },
      })
  );

  const wallets = useState(() => [new PhantomWalletAdapter()])[0];

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={RPC_ENDPOINT}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#112240",
                    border: "1px solid #1A3A52",
                    color: "#E2E8F0",
                  },
                }}
              />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
