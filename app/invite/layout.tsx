import { AuthWalletProviders } from "@/components/providers/AuthWalletProviders";

// /invite accepts team invites via wallet signature, so it needs Privy too.
export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <AuthWalletProviders>{children}</AuthWalletProviders>;
}
