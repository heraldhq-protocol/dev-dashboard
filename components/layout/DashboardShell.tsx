"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-navy text-foreground">
      {/* Subtle dot-grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-dot-grid opacity-50" aria-hidden="true" />

      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
