"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { createSignInChallenge } from "@/lib/auth-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const { publicKey, signMessage, wallet, connect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWalletLogin = async () => {
    try {
      setLoading(true);
      setError("");

      if (!connected) {
        if (!wallet) {
          setVisible(true);
          setLoading(false);
          return;
        }
        await connect();
      }

      const activePublicKey = publicKey || wallet?.adapter?.publicKey;

      if (!activePublicKey) {
        throw new Error("Wallet not connected completely");
      }

      if (!signMessage) {
        throw new Error("Wallet does not support message signing");
      }

      const timestamp = Date.now();
      const message = createSignInChallenge(activePublicKey.toBase58(), timestamp);
      const encodedMessage = new TextEncoder().encode(message);

      const signature = await signMessage(encodedMessage);

      const res = await signIn("wallet", {
        wallet: activePublicKey.toBase58(),
        signature: bs58.encode(signature),
        message,
        callbackUrl: "/overview",
        redirect: false,
      });

      if (res?.error) {
        setError("Authentication failed: Invalid credentials or not registered");
      } else if (res?.ok) {
        router.push(res.url || "/overview");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[440px] px-4">
      {/* Logo */}
      <div className="mb-10 flex flex-row items-center justify-center gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border shadow-[0_0_20px_rgba(91,53,213,0.15)] group hover:shadow-[0_0_30px_rgba(0,200,150,0.2)] transition-all duration-300">
          <Image width={36} height={36} src={"/logo.svg"} alt="logo" priority />
        </div>
        <span className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-[0_2px_10px_rgba(0,200,150,0.2)]">Herald</span>
      </div>

      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle inner top highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-teal/50 to-transparent" />
        
        <h2 className="mb-2 text-2xl font-bold text-primary-foreground text-center">Protocol Access</h2>
        <p className="mb-8 text-sm text-text-muted text-center">Connect your registered wallet to continue</p>

        {error && (
          <div className="mb-6 rounded-lg border border-red/20 bg-red/10 p-3 text-sm text-red animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <Button
          variant="default"
          className="w-full h-12 text-base shadow-[0_0_20px_rgba(0,200,150,0.2)] hover:shadow-[0_0_30px_rgba(0,200,150,0.35)] transition-all duration-300 relative overflow-hidden group"
          onClick={handleWalletLogin}
          disabled={loading}
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (connected && publicKey) ? (
              "Sign Message to Login"
            ) : (
              "Connect Wallet"
            )}
          </span>
        </Button>

        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-sm text-text-muted">
            Don't have a registered wallet?{" "}
            <Link 
              href="/onboarding" 
              className="font-medium text-teal hover:text-teal-2 transition-colors hover:underline underline-offset-4 decoration-teal/30"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
