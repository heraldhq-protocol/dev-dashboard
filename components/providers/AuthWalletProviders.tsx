"use client";

import { useEffect, useRef } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { identify, trackEvent } from "@adtivity/adtivity-sdk";
import { PrivyProvider } from "@/components/providers/PrivyProvider";

// Adtivity analytics only runs in the production deployment (see ClientProviders).
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

// Tracks the connected Privy wallet for Adtivity. Lives inside the Privy scope,
// which only wraps the auth/invite routes — the only place wallets connect.
function AdtivityWalletTracker() {
  const { wallets } = useWallets();
  const lastTrackedWallet = useRef<string | null>(null);

  useEffect(() => {
    if (!IS_PRODUCTION) return;

    const activeWallet = wallets.find((w) => w.address);
    if (activeWallet) {
      if (lastTrackedWallet.current !== activeWallet.address) {
        lastTrackedWallet.current = activeWallet.address;
        try {
          identify(activeWallet.address);
          trackEvent("Wallet Connected", { wallet_address: activeWallet.address });
        } catch (err) {
          console.warn("Adtivity failed to track Privy wallet:", err);
        }
      }
      return;
    }

    lastTrackedWallet.current = null;
  }, [wallets]);

  return null;
}

/**
 * Wallet/auth providers scoped to the routes that actually use them
 * (the (auth) group and /invite). Keeping Privy out of the global tree means
 * the dashboard bundle no longer pulls in the wallet SDK.
 */
export function AuthWalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider>
      <AdtivityWalletTracker />
      {children}
    </PrivyProvider>
  );
}
