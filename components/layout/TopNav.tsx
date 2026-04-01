"use client";

import { useUiStore } from "@/lib/stores/ui.store";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export function TopNav() {
  const { toggleMobileSidebar, toggleDesktopSidebar, desktopSidebarCollapsed, activeEnvironment, setEnvironment } = useUiStore();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-navy/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden text-text-secondary hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button 
          onClick={toggleDesktopSidebar}
          className="hidden lg:block text-text-secondary hover:text-white transition-colors"
          title={desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={desktopSidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h8m-8 6h16"} />
          </svg>
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          {/* TODO: Add logo and make push */}
          <Image src="/logo.svg" alt="Herald Logo" width={24} height={24} className="h-6 w-6 object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-white">Herald</span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-l border-border pl-4">
        <div className="flex items-center gap-2 rounded-lg bg-card-2 p-1">
          <button
            onClick={() => setEnvironment("sandbox")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeEnvironment === "sandbox" ? "bg-gold text-navy shadow-sm" : "text-text-muted hover:text-white"
            }`}
          >
            SANDBOX
          </button>
          <button
            onClick={() => setEnvironment("live")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeEnvironment === "live" ? "bg-teal text-navy shadow-sm" : "text-text-muted hover:text-white"
            }`}
          >
            LIVE
          </button>
        </div>
        
        <div className="hidden border-l border-border pl-4 sm:flex items-center gap-4">
          <span className="text-sm font-semibold text-text-secondary">
            {session?.user?.id ? `${session.user.id.slice(0,4)}...${session.user.id.slice(-4)}` : "Developer"}
          </span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
