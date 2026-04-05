"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import bs58 from "bs58";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerProtocol } from "@/lib/api/protocol";
import { createSignInChallenge } from "@/lib/auth-utils";

const STEPS = ["Welcome", "Connect Wallet", "Protocol Details", "Register", "Success"] as const;
type Step = (typeof STEPS)[number];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 mx-auto">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border transition-all ${
              i < current
                ? "bg-teal border-teal text-navy"
                : i === current
                ? "border-teal text-teal"
                : "border-border text-text-dim"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-xs hidden sm:block ${
              i === current ? "text-white font-semibold" : "text-text-dim"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-8 ${i < current ? "bg-teal" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [protocolName, setProtocolName] = useState("");
  const [website, setWebsite] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isNotProtocol, setIsNotProtocol] = useState(false);

  // Success state
  const [apiKey, setApiKey] = useState("");
  const [apiKeyPrefix, setApiKeyPrefix] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Step 1: Connect wallet ──────────────────────────────────────────
  const handleConnectWallet = () => {
    console.log("handleConnectWallet clicked", { publicKey: publicKey?.toBase58() });
    if (publicKey) {
      setStep(2);
    } else {
      console.log("Calling setVisible(true) for wallet modal");
      setVisible(true);
    }
  };

  // Auto-advance when wallet connects (only if we're at the connect step)
  useEffect(() => {
    if (publicKey && step === 1) {
      console.log("Wallet connected, auto-advancing to step 2");
      setStep(2);
    }
  }, [publicKey, step]);

  // ── Step 1: Validate form ───────────────────────────────────────────
  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolName.trim() || !adminEmail.trim()) return;
    setStep(3);
  };

  // ── Step 2: Sign + register ─────────────────────────────────────────
  const handleRegister = async () => {
    if (!publicKey || !signMessage) {
      toast.error("Wallet not connected");
      return;
    }
    setLoading(true);
    try {
      const timestamp = Date.now();
      const message = createSignInChallenge(publicKey.toBase58(), timestamp);
      const encoded = new TextEncoder().encode(message);
      const sigBytes = await signMessage(encoded);
      const signature = bs58.encode(sigBytes);

      const result = await registerProtocol({
        walletPubkey: publicKey.toBase58(),
        signature,
        message,
        protocolName: protocolName.trim(),
        website: website.trim() || undefined,
        adminEmail: adminEmail.trim(),
      });

      setApiKey(result.apiKey);
      setApiKeyPrefix(result.apiKeyPrefix);

      // Sign in to establish the session with the new protocolId
      await signIn("wallet", {
        wallet: publicKey.toBase58(),
        signature,
        message,
        callbackUrl: "/overview",
        redirect: true,
      });

      // No need for setStep(4) if redirect is true, but keeping it for completeness if someone navigates back
      setStep(4);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-navy px-4 overflow-x-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[700px] max-w-full rounded-full bg-teal/6 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[700px]">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3 mx-auto">
          <Image width={30} height={30} src="/logo.svg" alt="logo" />
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Herald
          </span>
        </div>

        <StepIndicator current={step} />

        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl max-w-[640px] mx-auto">
          {/* ── Step 0: Welcome / Confirmation ── */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-6 text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center text-3xl">
                👋
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Welcome to Herald
                </h1>
                <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
                  The Herald Dev Dashboard is a control panel for protocols to
                  manage notifications and user engagement.
                </p>
                <div className="mt-6 p-4 rounded-xl bg-navy-2 border border-border text-left">
                  <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-1">
                    Please Confirm
                  </p>
                  <p className="text-sm text-white font-medium">
                    Are you onboarding as a Protocol Developer or Team?
                  </p>
                </div>
              </div>

              {!isNotProtocol ? (
                <div className="flex flex-col w-full gap-3">
                  <Button
                    variant="primary"
                    className="w-full text-base py-6"
                    onClick={() => setStep(1)}
                  >
                    Yes, I&apos;m a Protocol
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full py-6 border-border-2"
                    onClick={() => setIsNotProtocol(true)}
                  >
                    No, I&apos;m just exploring
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 rounded-xl bg-red/10 border border-red/20 text-left">
                    <p className="text-sm text-red font-medium">
                      Onboarding is restricted.
                    </p>
                    <p className="text-xs text-red/80 mt-1">
                      Currently, the dashboard is exclusively for established
                      protocols. If you are a user looking to manage your
                      notifications, please visit our main portal.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsNotProtocol(false)}
                  >
                    Go Back
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Connect Wallet ── */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-6 text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center text-3xl">
                🔗
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Connect Your Wallet
                </h1>
                <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
                  Connect the Solana wallet that will manage your protocol
                  account.
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full text-base"
                onClick={handleConnectWallet}
              >
                {publicKey ? "Continue Registration" : "Connect Wallet"}
              </Button>
              {publicKey && (
                <p className="text-xs text-teal font-mono">
                  {publicKey.toBase58().slice(0, 16)}…
                </p>
              )}
              <Button
                variant="ghost"
                className="w-full text-xs text-text-dim"
                onClick={() => setStep(0)}
              >
                ← Back
              </Button>
            </div>
          )}

          {/* ── Step 2: Protocol Details ── */}
          {step === 2 && (
            <form onSubmit={handleDetailsNext} className="flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-bold text-white">Protocol Details</h1>
                <p className="text-sm text-text-muted mt-1">
                  Tell us about your protocol.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Protocol Name <span className="text-red">*</span>
                </label>
                <Input
                  value={protocolName}
                  onChange={(e) => setProtocolName(e.target.value)}
                  placeholder="e.g. Drift Protocol"
                  required
                  autoFocus
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Website URL
                </label>
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://your-protocol.xyz"
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Admin Email <span className="text-red">*</span>
                </label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@your-protocol.xyz"
                  required
                  className="w-full"
                />
                <p className="text-xs text-text-dim">
                  Used for account notifications and team invites.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={!protocolName.trim() || !adminEmail.trim()}
                >
                  Continue
                </Button>
              </div>
            </form>
          )}

          {/* ── Step 3: Sign & Register ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-bold text-white">Sign & Register</h1>
                <p className="text-sm text-text-muted mt-1">
                  Your wallet will sign a message verifying ownership. No gas fees
                  — this is off-chain.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-navy-2 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Protocol Name</span>
                  <span className="text-white font-semibold">{protocolName}</span>
                </div>
                {website && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Website</span>
                    <span className="text-white font-mono text-xs">{website}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Admin Email</span>
                  <span className="text-white">{adminEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Owner Wallet</span>
                  <span className="text-teal font-mono text-xs">
                    {publicKey?.toBase58().slice(0, 12)}…
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleRegister}
                  isLoading={loading}
                >
                  {loading ? "Signing…" : "Sign & Register →"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div className="flex flex-col gap-5 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h1 className="text-xl font-bold text-white">
                  Protocol Registered!
                </h1>
                <p className="text-sm text-text-muted max-w-xs mx-auto">
                  Your Herald protocol account is live. Save your API key — it
                  won&apos;t be shown again.
                </p>
              </div>

              <div className="rounded-xl border border-teal/20 bg-teal/5 p-4">
                <p className="text-xs text-text-muted mb-2 text-left font-semibold uppercase tracking-wider">
                  Sandbox API Key
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate font-mono text-xs text-teal bg-teal/10 rounded-lg px-3 py-2 tracking-wide break-all text-left">
                    {revealed ? apiKey : `${apiKeyPrefix}${"•".repeat(35)}`}
                  </code>
                  <button
                    onClick={() => setRevealed((r) => !r)}
                    className="shrink-0 text-xs text-text-muted hover:text-white px-2 py-1 rounded border border-border hover:border-teal/40 transition-all"
                  >
                    {revealed ? "Hide" : "Reveal"}
                  </button>
                  <button
                    onClick={handleCopyKey}
                    className="shrink-0 text-xs px-2 py-1 rounded border border-border hover:border-teal/40 text-text-muted hover:text-teal transition-all"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gold text-left">
                ⚠ This key will not be shown again. Store it in a secure environment variable.
              </p>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push("/overview")}
              >
                Go to Dashboard →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
