"use client";

import { useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

import "@solana/wallet-adapter-react-ui/styles.css";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  
  // Use public mainnet/devnet fallback or custom RPC
  const endpoint = "https://api.mainnet-beta.solana.com"; 
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter()
    ],
    []
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </SessionProvider>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}
