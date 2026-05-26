"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { handleTwitterCallback } from "@/lib/api/twitter";

type Phase = "loading" | "success" | "error";

export default function XCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("loading");
  const [xUsername, setXUsername] = useState<string>("");
  const [xVerified, setXVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg("Twitter authorization was denied or cancelled.");
      setPhase("error");
      return;
    }

    if (!code || !state) {
      setErrorMsg("Missing OAuth parameters — please try again.");
      setPhase("error");
      return;
    }

    handleTwitterCallback(code, state)
      .then((result) => {
        setXUsername(result.xUsername ?? "");
        setXVerified(result.xVerified ?? false);
        setPhase("success");
        // Invalidate protocol cache so dashboard shows active state
        queryClient.invalidateQueries({ queryKey: ["protocol"] });
        queryClient.invalidateQueries({ queryKey: ["twitterStatus"] });
        // Auto-redirect after 3 seconds
        setTimeout(() => router.push("/overview"), 3000);
      })
      .catch((err) => {
        setErrorMsg(err?.message ?? "Failed to connect your X account. Please try again.");
        setPhase("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-navy-2 via-navy to-navy" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-teal/10 rounded-full blur-[120px] pointer-events-none opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logo.svg" alt="Herald" width={32} height={32} />
        </div>

        <div className="rounded-3xl border border-white/5 bg-navy-2/60 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] text-center">
          {phase === "loading" && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="h-12 w-12 rounded-full border-2 border-teal border-t-transparent animate-spin" />
              <div>
                <p className="font-semibold text-foreground">Connecting your X account…</p>
                <p className="text-sm text-text-muted mt-1">Verifying with Twitter</p>
              </div>
            </div>
          )}

          {phase === "success" && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="h-16 w-16 rounded-full bg-teal/10 border border-teal/30 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,200,150,0.2)]">
                ✓
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Protocol Activated!</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Connected{" "}
                  <span className="text-teal font-semibold">@{xUsername}</span>
                  {xVerified && (
                    <span className="ml-1.5 inline-flex items-center gap-1 text-xs text-blue-400 font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-dim mt-1">
                  Your protocol is now active and can send notifications.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-dim">
                <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                Redirecting to dashboard…
              </div>
              <button
                onClick={() => router.push("/overview")}
                className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-navy hover:bg-teal/90 transition-colors"
              >
                Go to Dashboard →
              </button>
            </div>
          )}

          {phase === "error" && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="h-16 w-16 rounded-full bg-red/10 border border-red/20 flex items-center justify-center text-3xl">
                ✕
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Connection Failed</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{errorMsg}</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => router.back()}
                  className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-navy hover:bg-teal/90 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/overview")}
                  className="w-full text-sm text-text-muted hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
