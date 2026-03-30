"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { createSignInChallenge } from "@/lib/auth-utils";

// Inlined SVG — eliminates next/image deployment dependency entirely.
// SVG has its own white bg rect + teal inner rect so no wrapper bg needed.
function HeraldLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 764 764"
      className={className}
      aria-label="Herald Logo"
    >
      <defs>
        <style>{`.cls-1{fill:#fff;}.cls-2{fill:#00c896;}`}</style>
      </defs>
      <g>
        <rect className="cls-1" width="764" height="764" rx="178.21" />
      </g>
      <g>
        <rect className="cls-2" x="224.5" y="195.5" width="329" height="360" rx="47.2" />
      </g>
      <g>
        <circle className="cls-1" cx="387.5" cy="360.5" r="86" />
      </g>
      <g>
        <rect className="cls-1" x="301.5" y="358.5" width="172" height="201" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const { publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWalletLogin = async () => {
    try {
      setLoading(true);
      setError("");

      if (!publicKey) {
        setVisible(true);
        setLoading(false);
        return;
      }

      if (!signMessage) {
        throw new Error("Wallet does not support message signing");
      }

      const nonce = Math.random().toString(36).substring(2, 10);
      const message = createSignInChallenge(nonce);
      const encodedMessage = new TextEncoder().encode(message);

      const signature = await signMessage(encodedMessage);

      const res = await signIn("wallet", {
        wallet: publicKey.toBase58(),
        signature: bs58.encode(signature),
        message,
        redirect: true,
        callbackUrl: "/overview",
      });

      if (res?.error) {
        setError("Wallet login failed. Are you registered as an admin?");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign message");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await signIn("email", {
        email,
        password,
        totp,
        redirect: true,
        callbackUrl: "/overview",
      });

      if (res?.error) {
        setError("Invalid credentials or TOTP");
      }
    } catch {
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy px-4 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[600px] max-w-full rounded-full bg-teal/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <HeraldLogo className="h-9 w-9 shrink-0 rounded-lg" />
          <span className="text-3xl font-extrabold tracking-tight text-white">Herald</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
          <h2 className="mb-6 text-xl font-bold text-white text-center">Sign in to Dashboard</h2>

          {error && (
            <div className="mb-6 rounded-lg border border-red/20 bg-red/10 p-3 text-sm text-red">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            className="w-full text-base shadow-[0_0_15px_rgba(0,200,150,0.15)]"
            onClick={handleWalletLogin}
            disabled={loading}
          >
            {loading ? "Connecting…" : publicKey ? "Sign Message to Login" : "Connect Wallet"}
          </Button>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-2" />
            </div>
            <div className="relative flex justify-center text-xs text-text-muted">
              <span className="bg-card px-2">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@protocol.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
                Authenticator Code (TOTP)
              </label>
              <Input
                type="text"
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                placeholder="123456"
                pattern="[0-9]{6}"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="mt-2 w-full"
              disabled={loading}
            >
              Sign in with Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
