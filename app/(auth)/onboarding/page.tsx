"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import bs58 from "bs58";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerProtocol } from "@/lib/api/protocol";
import { createSignInChallenge } from "@/lib/auth-utils";
import { apiClient } from "@/lib/api-client";

const REDIRECT_DELAY = 60; // seconds before auto-redirect on success step

const STEPS = ["Welcome", "Connect Wallet", "Protocol Details", "Register", "Success"] as const;

// ── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8 w-full flex-wrap">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
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
              i === current ? "text-foreground font-semibold" : "text-text-dim"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`hidden sm:block h-px w-6 ${i < current ? "bg-teal" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false); // for already-registered guard

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

  // Countdown for auto-redirect on success step
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Already-registered guard ────────────────────────────────────────────────
  // If the user is authenticated AND already has a protocol, skip onboarding.
  useEffect(() => {
    if (step === 4) return; // don't redirect if user just registered
    if (sessionStatus !== "authenticated") return;

    setChecking(true);
    apiClient
      .get("/protocols/me")
      .then(() => {
        // Protocol exists — redirect to dashboard
        router.replace("/overview");
      })
      .catch(() => {
        // 404/401 = no protocol yet, stay on onboarding
        setChecking(false);
      });
  }, [sessionStatus, step, router]);

  // ── Auto-advance when wallet connects ──────────────────────────────────────
  useEffect(() => {
    if (publicKey && step === 1) {
      const timer = setTimeout(() => setStep(2), 0);
      return () => clearTimeout(timer);
    }
  }, [publicKey, step]);

  // ── Countdown timer on success step ────────────────────────────────────────
  useEffect(() => {
    if (step !== 4) return;

    setCountdown(REDIRECT_DELAY);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          router.push("/overview");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step, router]);

  // ── Step handlers ──────────────────────────────────────────────────────────
  const handleConnectWallet = () => {
    if (publicKey) {
      setStep(2);
    } else {
      setVisible(true);
    }
  };

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolName.trim() || !adminEmail.trim()) return;
    setStep(3);
  };

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

      // Sign in to establish session (redirect: false so user sees their API key first)
      const signInResult = await signIn("wallet", {
        wallet: publicKey.toBase58(),
        signature,
        message,
        redirect: false,
      });

      if (signInResult?.error) {
        console.warn("Session creation failed after registration:", signInResult.error);
        toast.error("Registration succeeded but auto-login failed. Please log in from the login page.");
      }

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

  const handleGoToDashboard = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    router.push("/overview");
  };

  // ── Redirect guard loading state ───────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="h-5 w-5 rounded-full border-2 border-teal border-t-transparent animate-spin" />
          <span className="text-sm">Checking account…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-navy px-4 overflow-x-hidden selection:bg-teal/30">
      {/* Premium ambient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-navy-2 via-navy to-navy" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-teal/10 rounded-full blur-[120px] pointer-events-none opacity-60" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-[700px] py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3 mx-auto">
          <Image width={30} height={30} src="/logo.svg" alt="logo" />
          <span className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
            Herald
          </span>
        </div>

        <StepIndicator current={step} />

        <div className="rounded-3xl border border-white/5 bg-navy-2/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] max-w-[640px] mx-auto animate-in fade-in zoom-in-95 duration-500">
          {/* ── Step 0: Welcome / Confirmation ── */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-6 text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center text-3xl">
                👋
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                  Welcome to Herald
                </h1>
                <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
                  The ultimate notification gateway. Set up your protocol to start sending messages directly to wallets.
                </p>
                <div className="mt-8 p-5 rounded-2xl bg-black/40 border border-white/5 text-left">
                  <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-1">
                    Please Confirm
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    Are you onboarding as a Protocol Developer or Team?
                  </p>
                </div>
              </div>

              {!isNotProtocol ? (
                <div className="flex flex-col w-full gap-3">
                  <Button
                    variant="default"
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
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Connect Your Wallet
                </h1>
                <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto">
                  Connect the Solana wallet that will be the owner of your protocol account.
                </p>
              </div>
              <Button
                variant="default"
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
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Protocol Details</h1>
                <p className="text-sm text-text-muted mt-1">
                  Tell us about your protocol to configure your workspace.
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
                  variant="default"
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
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Sign & Register</h1>
                <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto text-balance">
                  Your wallet will sign a message verifying ownership. No gas fees are required.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-navy-2 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Protocol Name</span>
                  <span className="text-foreground font-semibold">{protocolName}</span>
                </div>
                {website && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Website</span>
                    <span className="text-foreground font-mono text-xs">{website}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Admin Email</span>
                  <span className="text-foreground">{adminEmail}</span>
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
                  variant="default"
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
                {/* Countdown badge */}
                <div className="flex items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-linear-to-br from-teal/20 to-teal/5 border border-teal/30 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,200,150,0.2)]">
                    ✓
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight mt-2">
                  Protocol Registered!
                </h1>
                <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
                  Your Herald protocol account is live. Save your Sandbox API key securely — it
                  won&apos;t be shown again.
                </p>
              </div>

              <div className="rounded-2xl border border-teal/20 bg-linear-to-b from-teal/10 to-transparent p-5 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal/20 blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <p className="text-xs text-teal mb-3 font-bold uppercase tracking-widest relative z-10">
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

              {/* Countdown + Go to Dashboard */}
              <div className="flex flex-col gap-3 pt-1">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard →
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-text-dim">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                  <span>
                    Redirecting automatically in{" "}
                    <span className="text-teal font-mono font-semibold tabular-nums">
                      {countdown}s
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
