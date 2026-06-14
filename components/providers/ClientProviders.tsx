"use client";

import { useState, useEffect, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SolanaCluster } from "@herald-protocol/sdk";
import { init, initClickTracking, initPageTracking, initLocationTracking, identify, trackEvent } from "@adtivity/adtivity-sdk";
import { useWallets } from "@privy-io/react-auth/solana";

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

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingTourProvider } from "@/components/providers/OnboardingTourProvider";
import { PrivyProvider } from "@/components/providers/PrivyProvider";

declare global {
  interface Window {
    __ADTIVITY_BOOTSTRAPPED__?: boolean;
  }
}

// Automatically track connected wallets (Privy or Solana wallet adapter)
function AdtivityWalletTracker() {
  const { wallets: privyWallets } = useWallets();
  const { publicKey: adapterPublicKey, connected: adapterConnected } = useWallet();
  const lastTrackedWallet = useRef<string | null>(null);

  useEffect(() => {
    // 1. Check if Solana adapter is connected
    if (adapterConnected && adapterPublicKey) {
      const address = adapterPublicKey.toBase58();
      if (lastTrackedWallet.current !== address) {
        lastTrackedWallet.current = address;
        try {
          identify(address);
          trackEvent("Wallet Connected", { wallet_address: address });
        } catch (err) {
          console.warn("Adtivity failed to track Solana adapter wallet:", err);
        }
      }
      return;
    }

    // 2. Check if Privy is connected
    const activePrivyWallet = privyWallets.find((w) => w.address);
    if (activePrivyWallet) {
      const address = activePrivyWallet.address;
      if (lastTrackedWallet.current !== address) {
        lastTrackedWallet.current = address;
        try {
          identify(address);
          trackEvent("Wallet Connected", { wallet_address: address });
        } catch (err) {
          console.warn("Adtivity failed to track Privy wallet:", err);
        }
      }
      return;
    }

    // 3. Reset tracking on disconnect
    if (!adapterConnected && !activePrivyWallet) {
      lastTrackedWallet.current = null;
    }
  }, [adapterConnected, adapterPublicKey, privyWallets]);

  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__ADTIVITY_BOOTSTRAPPED__) return;
    window.__ADTIVITY_BOOTSTRAPPED__ = true;

    // Monkey-patch window.fetch to inject origin property into Adtivity SDK payloads
    const originalFetch = window.fetch;
    window.fetch = async function (input, initOptions) {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";
      if (url.includes("/sdk/event") && initOptions && initOptions.body) {
        try {
          const body = JSON.parse(initOptions.body as string);
          if (Array.isArray(body)) {
            const enrichedBody = body.map((event: any) => {
              if (!event.properties) {
                event.properties = {};
              }
              event.properties.origin = "dev-dashboard";
              return event;
            });
            initOptions.body = JSON.stringify(enrichedBody);
          }
        } catch (e) {
          console.warn("Failed to enrich Adtivity payload:", e);
        }
      }
      return originalFetch.apply(this, [input, initOptions]);
    };

    const API_KEY = process.env.NEXT_PUBLIC_ADTIVITY_API_KEY;
    if (!API_KEY) {
      console.error("Adtivity SDK: API key is not configured");
      return;
    }

    init({
      apiKey: API_KEY,
      debug: false,
    });

    initPageTracking();
    initClickTracking();
    initLocationTracking();
  }, []);

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
    <PrivyProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <ConnectionProvider endpoint={RPC_ENDPOINT}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <AdtivityWalletTracker />
                  <TooltipProvider>
                    <OnboardingTourProvider>
                      {children}
                    </OnboardingTourProvider>
                  </TooltipProvider>
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      style: {
                        background: "#112240",
                        border: "1px solid #1A3A52",
                        color: "#ffffff",
                      },
                      classNames: {
                        description: "text-text-muted text-sm mt-1",
                        actionButton: "bg-teal text-navy hover:bg-teal/90 font-medium px-4 py-2 rounded-md transition-colors",
                      }
                    }}
                  />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </QueryClientProvider>
        </SessionProvider>
      </ThemeProvider>
    </PrivyProvider>
  );
}
