"use client";

import { useUiStore } from "@/lib/stores/ui.store";
import { useSession, signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// ─── Breadcrumb helper ──────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  overview: "Overview",
  analytics: "Analytics",
  "api-keys": "API Keys",
  webhooks: "Webhooks",
  playground: "Playground",
  templates: "Templates",
  domains: "Domains",
  notifications: "Notifications",
  billing: "Billing & Usage",
  team: "Team",
  status: "System Status",
  settings: "Settings",
};

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg) => ({
    label: ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: `/${seg}`,
  }));

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5">
      {/* Dashboard root */}
      <span className="text-xs font-medium text-text-muted">Dashboard</span>

      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {/* Separator */}
          <svg
            className="h-3 w-3 text-text-muted/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {/* Last crumb = current page */}
          {i === crumbs.length - 1 ? (
            <span className="text-xs font-semibold text-foreground">
              {crumb.label}
            </span>
          ) : (
            <a
              href={crumb.href}
              className="text-xs font-medium text-text-muted hover:text-foreground transition-colors"
            >
              {crumb.label}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}

// ─── Avatar monogram ────────────────────────────────────────

function UserAvatar({ userId }: { userId?: string }) {
  const initials = userId ? userId.slice(0, 2).toUpperCase() : "D";
  return (
    <div
      className="relative h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-navy shrink-0 cursor-pointer select-none"
      style={{
        background: "linear-gradient(135deg, #00c896 0%, #00e5a8 100%)",
      }}
    >
      {initials}
      {/* Online status dot */}
      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green border-2 border-navy" />
    </div>
  );
}

// ─── Environment indicator ──────────────────────────────────

function EnvSwitcher({
  activeEnvironment,
  setEnvironment,
}: {
  activeEnvironment: string;
  setEnvironment: (env: "sandbox" | "live") => void;
}) {
  const isLive = activeEnvironment === "live";

  return (
    <>
      {/* Desktop: segmented pill */}
      <div className="hidden sm:flex items-center gap-0.5 rounded-lg bg-card-2 border border-border p-0.5">
        <button
          onClick={() => setEnvironment("sandbox")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
            !isLive
              ? "bg-gold/15 border border-gold/30 text-gold shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {!isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
          )}
          SANDBOX
        </button>
        <button
          onClick={() => setEnvironment("live")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
            isLive
              ? "bg-teal/15 border border-teal/30 text-teal shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse flex-shrink-0" />
          )}
          LIVE
        </button>
      </div>

      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer border ${
                isLive
                  ? "bg-teal/15 border-teal/30 text-teal"
                  : "bg-gold/15 border-gold/30 text-gold"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isLive ? "bg-teal animate-pulse" : "bg-gold"}`}
              />
              {isLive ? "LIVE" : "SANDBOX"}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="opacity-70 ml-0.5">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[130px]">
            <DropdownMenuItem
              onClick={() => setEnvironment("sandbox")}
              className={`text-xs font-bold cursor-pointer ${!isLive ? "bg-accent" : ""}`}
            >
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gold" />
              SANDBOX
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEnvironment("live")}
              className={`text-xs font-bold cursor-pointer ${isLive ? "bg-accent" : ""}`}
            >
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-teal" />
              LIVE
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

// ─── Search badge ───────────────────────────────────────────

function SearchBadge() {
  return (
    <button
      className="hidden lg:flex items-center gap-2 rounded-lg border border-border bg-card-2 px-3 py-1.5 text-xs text-text-muted hover:text-foreground hover:border-border-2 transition-all duration-200 cursor-pointer group"
      aria-label="Search (⌘K)"
    >
      <svg className="h-3.5 w-3.5 group-hover:text-teal transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="font-medium">Search…</span>
      <kbd className="ml-1 rounded border border-border px-1 py-0.5 font-mono text-[10px] text-text-muted">
        ⌘K
      </kbd>
    </button>
  );
}

// ─── Notification bell ──────────────────────────────────────

function NotificationBell() {
  const [hasNotif] = useState(true); // cosmetic — shows badge dot

  return (
    <button
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-foreground hover:bg-card-2 transition-colors cursor-pointer"
      aria-label="Notifications"
    >
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {hasNotif && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal border-2 border-navy" />
      )}
    </button>
  );
}

// ─── TopNav ─────────────────────────────────────────────────

export function TopNav() {
  const {
    toggleMobileSidebar,
    toggleDesktopSidebar,
    desktopSidebarCollapsed,
    activeEnvironment,
    setEnvironment,
  } = useUiStore();
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-navy/90 px-4 backdrop-blur-md sm:px-5 gap-4">
      {/* ── Left: Hamburger + Logo (mobile) + Breadcrumb ── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-text-secondary hover:text-text-primary transition-colors cursor-pointer p-1 rounded-md hover:bg-card-2"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-card-2 transition-colors cursor-pointer"
          title={desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={desktopSidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h8m-8 6h16"}
            />
          </svg>
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <Image src="/logo.svg" alt="Herald Logo" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
          <span className="text-base font-extrabold tracking-tight text-text-primary">Herald</span>
        </div>

        {/* Breadcrumb — desktop */}
        <Breadcrumb pathname={pathname} />
      </div>

      {/* ── Right: search, env switcher, bell, theme, user ── */}
      <div className="flex items-center gap-2 shrink-0">
        <SearchBadge />

        <div className="h-4 w-px bg-border hidden sm:block" />

        <EnvSwitcher
          activeEnvironment={activeEnvironment}
          setEnvironment={setEnvironment}
        />

        <div className="h-4 w-px bg-border" />

        <NotificationBell />
        <ThemeToggle />

        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-card-2 transition-colors cursor-pointer group" aria-label="User menu">
              <UserAvatar userId={session?.user?.id} />
              <span className="hidden sm:block text-xs font-semibold text-text-secondary group-hover:text-foreground transition-colors">
                {session?.user?.id
                  ? `${session.user.id.slice(0, 4)}…${session.user.id.slice(-4)}`
                  : "Developer"}
              </span>
              <svg className="hidden sm:block h-3 w-3 text-text-muted" fill="none" viewBox="0 0 12 12">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Developer Account</p>
              {session?.user?.id && (
                <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">
                  {session.user.id}
                </p>
              )}
            </div>
            <DropdownMenuItem
              className="text-xs cursor-pointer gap-2"
              onClick={() => {
                if (session?.user?.id) {
                  navigator.clipboard.writeText(session.user.id);
                }
              }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs cursor-pointer gap-2 text-red focus:text-red focus:bg-red/10"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
