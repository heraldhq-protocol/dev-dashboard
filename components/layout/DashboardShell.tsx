"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useUiStore } from "@/lib/stores/ui.store";
import { useQueryClient } from "@tanstack/react-query";
import { NextStepViewport } from "nextstepjs";
import { FlaskConical } from "lucide-react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { identify } from "@adtivity/adtivity-sdk";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id && process.env.NEXT_PUBLIC_ADTIVITY_API_KEY) {
      try {
        identify(session.user.id, {
          email: session.user.email ?? undefined,
          name: session.user.name ?? undefined,
          walletAddress: session.user.walletAddress ?? undefined,
        });
      } catch (err) {
        console.warn("Adtivity identify failed", err);
      }
    }
  }, [session?.user]);
  const { activeEnvironment, setEnvironment } = useUiStore();
  const queryClient = useQueryClient();
  const isSandbox = activeEnvironment === "sandbox";

  const switchToLive = () => {
    setEnvironment("live");
    queryClient.invalidateQueries();
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-navy text-foreground">
      {/* Subtle dot-grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-dot-grid opacity-50" aria-hidden="true" />

      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <TopNav />

        {/* Sandbox mode banner */}
        {isSandbox && (
          <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-status-warning/8 border-b border-status-warning/20 shrink-0">
            <FlaskConical className="h-3 w-3 text-status-warning shrink-0" />
            <p className="text-[11px] font-semibold text-status-warning">
              Sandbox mode — analytics show randomly generated demo data. Switch to{" "}
              <button
                onClick={switchToLive}
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Live
              </button>{" "}
              to see real data.
            </p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto" id="dashboard-scroll-container">
          <NextStepViewport id="dashboard-viewport">
            <div className="mx-auto w-full max-w-7xl p-8">
              {children}
            </div>
          </NextStepViewport>
        </main>
      </div>

    </div>
  );
}
