"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
// import { TourInitializer } from "@/components/onboarding/TourInitializer";
import { NextStepViewport } from "nextstepjs";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-navy text-foreground">
      {/* Subtle dot-grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-dot-grid opacity-50" aria-hidden="true" />

      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto" id="dashboard-scroll-container">
          <NextStepViewport id="dashboard-viewport">
            <div className="mx-auto w-full max-w-7xl p-8">
              {children}
            </div>
          </NextStepViewport>
        </main>
      </div>

      {/* Tour fires once on first load, invisible component */}
      {/* <TourInitializer /> */}
    </div>
  );
}
