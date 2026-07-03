import { AuthWalletProviders } from "@/components/providers/AuthWalletProviders";

// Privy (wallet auth) is scoped to the auth routes only, so the rest of the
// app — notably the dashboard — doesn't load the wallet SDK.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthWalletProviders>{children}</AuthWalletProviders>;
}
