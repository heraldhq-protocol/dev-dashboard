"use client";

import { useEffect, useState, Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import bs58 from "bs58";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { acceptInvite } from "@/lib/api/team";
import { createSignInChallenge } from "@/lib/auth-utils";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing invite token");
      router.push("/login");
    }
  }, [token, router]);

  const handleConnectAndAccept = async () => {
    if (!token) return;

    if (!publicKey) {
      setVisible(true);
      return;
    }

    if (!signMessage) {
      toast.error("Wallet does not support message signing");
      return;
    }

    setLoading(true);
    try {
      // 1. Accept the invite to associate this wallet with the team member
      await acceptInvite({
        inviteToken: token,
        walletPubkey: publicKey.toBase58(),
      });
      
      setAccepted(true);
      toast.success("Invite accepted! Signing in...");

      // 2. Sign in to establish the session
      const timestamp = Date.now();
      const message = createSignInChallenge(publicKey.toBase58(), timestamp);
      const encoded = new TextEncoder().encode(message);
      const sigBytes = await signMessage(encoded);
      const signature = bs58.encode(sigBytes);

      const signInResult = await signIn("wallet", {
        wallet: publicKey.toBase58(),
        signature,
        message,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // 3. Redirect to dashboard
      router.push("/overview");
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.message || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="relative z-10 w-full max-w-[500px] py-12 mx-auto">
      <div className="mb-8 flex items-center justify-center gap-3 mx-auto">
        <Image width={30} height={30} src="/logo.svg" alt="logo" />
        <span className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
          Herald
        </span>
      </div>

      <div className="rounded-3xl border border-white/5 bg-navy-2/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500 text-center">
        <div className="h-16 w-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center text-3xl mx-auto mb-6">
          🤝
        </div>
        
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          {accepted ? "Welcome to the Team!" : "Accept Team Invite"}
        </h1>
        
        <p className="text-sm text-text-muted mb-8 text-balance">
          {accepted 
            ? "Your account is ready. Redirecting you to the dashboard..." 
            : "You've been invited to join a Herald Protocol. Connect your wallet to accept the invitation and sign in."}
        </p>

        {!accepted && (
          <div className="space-y-4">
            {publicKey ? (
              <div className="p-4 rounded-xl border border-border bg-navy-2 mb-4 text-left">
                <p className="text-xs text-text-muted mb-1">Connected Wallet</p>
                <p className="text-sm font-mono text-teal">
                  {publicKey.toBase58().slice(0, 12)}...{publicKey.toBase58().slice(-12)}
                </p>
              </div>
            ) : null}

            <Button
              onClick={handleConnectAndAccept}
              className="w-full py-6 text-base"
              isLoading={loading}
            >
              {publicKey ? "Accept & Sign In" : "Connect Wallet"}
            </Button>
            
            {publicKey && (
              <Button
                variant="ghost"
                className="w-full text-xs text-text-dim"
                onClick={() => setVisible(true)}
                disabled={loading}
              >
                Use a different wallet
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-navy px-4 overflow-x-hidden selection:bg-teal/30">
      {/* Premium ambient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-navy-2 via-navy to-navy" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-teal/10 rounded-full blur-[120px] pointer-events-none opacity-60" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      </div>
      
      <Suspense fallback={
        <div className="relative z-10 w-full max-w-[500px] py-12 mx-auto flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
        </div>
      }>
        <InviteContent />
      </Suspense>
    </div>
  );
}
