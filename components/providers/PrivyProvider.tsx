"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    console.warn(
      "[Privy] NEXT_PUBLIC_PRIVY_APP_ID is not set. Privy auth will not work.",
    );
    return <>{children}</>;
  }

  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet", "email", "google", "discord", "github"],
        appearance: {
          theme: "dark",
          walletChainType: "solana-only",
          showWalletLoginFirst: true,
          landingHeader: "Log in to Herald",
          walletList: ["phantom", "detected_solana_wallets", "wallet_connect"],
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "all-users",
          },
        },
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
}
