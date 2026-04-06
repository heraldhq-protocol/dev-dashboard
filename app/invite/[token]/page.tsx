"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { acceptInvite } from "@/lib/api/team";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const { publicKey, signMessage, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleAccept = async () => {
    if (!publicKey || !signMessage) {
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const message = `Accept Herald Team Invite\nToken: ${token}\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`;
      const encoded = new TextEncoder().encode(message);
      await signMessage(encoded); // verifies ownership; actual auth via token

      await acceptInvite({
        inviteToken: token,
        walletPubkey: publicKey.toBase58(),
      });

      setDone(true);
      toast.success("You've joined the team! Redirecting to login…");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept invite. It may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-navy px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[600px] max-w-full rounded-full bg-teal/7 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image width={28} height={28} src="/logo.svg" alt="logo" />
          <span className="text-2xl font-extrabold tracking-tight text-white">Herald</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-14 w-14 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-2xl">✓</div>
              <h1 className="text-xl font-bold text-white">Invite Accepted!</h1>
              <p className="text-sm text-text-muted">Redirecting you to login…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center text-2xl">📨</div>
              <div>
                <h1 className="text-xl font-bold text-white">Team Invitation</h1>
                <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
                  You&apos;ve been invited to join a protocol team on Herald. Connect your
                  Solana wallet to accept.
                </p>
              </div>

              {connected && publicKey ? (
                <div className="w-full space-y-4">
                  <div className="rounded-lg border border-teal/20 bg-teal/5 px-4 py-2.5 text-sm text-teal font-mono">
                    {publicKey.toBase58().slice(0, 20)}…
                  </div>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleAccept}
                    isLoading={loading}
                  >
                    {loading ? "Accepting…" : "Accept Invitation"}
                  </Button>
                  <button
                    className="text-xs text-text-muted hover:text-white transition-colors"
                    onClick={() => setVisible(true)}
                  >
                    Switch wallet
                  </button>
                </div>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => setVisible(true)}
                >
                  Connect Wallet to Accept
                </Button>
              )}

              <p className="text-xs text-text-dim">
                Invite token: <span className="font-mono">{token?.slice(0, 12)}…</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
