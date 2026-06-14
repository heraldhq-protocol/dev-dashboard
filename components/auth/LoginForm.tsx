"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignMessage,
} from "@privy-io/react-auth/solana";
import bs58 from "bs58";
import { createSignInChallenge } from "@/lib/auth-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const {
    ready,
    authenticated,
    login,
  } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();

  const router = useRouter();

  const [error, setError] = useState("");
  const [step, setStep] = useState<"idle" | "authenticating" | "signing" | "redirecting">("idle");

  const processing = useRef(false);

  const solanaWallet = wallets.find((w) => w.address) ?? null;

  const completeAuthWithWallet = useCallback(
    async (wallet: NonNullable<typeof solanaWallet>) => {
      if (processing.current) return;
      processing.current = true;

      try {
        setStep("signing");
        setError("");

        const walletAddress = wallet.address;
        const timestamp = Date.now();
        const message = createSignInChallenge(walletAddress, timestamp);
        const encodedMessage = new TextEncoder().encode(message);

        const { signature: signatureBytes } = await signMessage({
          message: encodedMessage,
          wallet,
        });

        const signatureEncoded = bs58.encode(signatureBytes);

        setStep("redirecting");

        const res = await signIn("wallet", {
          wallet: walletAddress,
          signature: signatureEncoded,
          message,
          callbackUrl: "/overview",
          redirect: false,
        });

        if (res?.error) {
          setError("Authentication failed: Wallet not registered or backend unavailable");
          setStep("idle");
        } else if (res?.ok) {
          router.push(res.url || "/overview");
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to sign message";
        setError(msg);
        setStep("idle");
      } finally {
        processing.current = false;
      }
    },
    [signMessage, router],
  );

  useEffect(() => {
    if (
      ready &&
      authenticated &&
      solanaWallet &&
      step === "authenticating"
    ) {
      completeAuthWithWallet(solanaWallet);
    }
  }, [ready, authenticated, solanaWallet, step, completeAuthWithWallet]);

  const handleLogin = () => {
    setError("");
    setStep("authenticating");
    login();
  };

  if (!ready) {
    return (
      <div className="relative z-10 w-full max-w-[440px] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-card border border-border" />
          <div className="h-8 w-48 animate-pulse rounded bg-card" />
          <div className="h-4 w-64 animate-pulse rounded bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-[440px] px-4">
      {/* Logo */}
      <div className="mb-10 flex flex-row items-center justify-center gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border shadow-[0_0_20px_rgba(91,53,213,0.15)] group hover:shadow-[0_0_30px_rgba(0,200,150,0.2)] transition-all duration-300">
          <Image width={36} height={36} src={"/logo.svg"} alt="logo" priority />
        </div>
        <span className="text-4xl font-heading font-extrabold tracking-tight text-primary drop-shadow-[0_2px_10px_rgba(0,200,150,0.2)]">Herald</span>
      </div>

      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle inner top highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-teal/50 to-transparent" />

        <h2 className="mb-2 text-2xl font-bold text-foreground text-center">Protocol Access</h2>
        <p className="mb-8 text-sm text-text-muted text-center">
          {step === "authenticating"
            ? "Authenticate with your preferred method"
            : "Sign in to your Herald dashboard"}
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red/20 bg-red/10 p-3 text-sm text-red animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {step === "signing" || step === "redirecting" ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <svg
              className="animate-spin h-8 w-8 text-teal"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-text-muted">
              {step === "signing" ? "Signing message..." : "Redirecting..."}
            </p>
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full h-12 text-base shadow-[0_0_20px_rgba(0,200,150,0.2)] hover:shadow-[0_0_30px_rgba(0,200,150,0.35)] transition-all duration-300 relative overflow-hidden group"
            onClick={handleLogin}
            disabled={step === "authenticating"}
            data-adtivity-button-track="Connect Wallet or Sign In"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {step === "authenticating" ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </>
              ) : (
                "Connect Wallet or Sign In"
              )}
            </span>
          </Button>
        )}

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
