"use client";

import { useUiStore } from "@/lib/stores/ui.store";
import { useSession } from "next-auth/react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Image from "next/image";
import { usePathname } from "next/navigation";


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
      <span className="text-xs font-medium text-muted">Dashboard</span>

      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
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
    <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5">
      <button
        onClick={() => setEnvironment("sandbox")}
        className={`flex items-center gap-1.5 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
          !isLive
            ? "bg-status-warning/10 text-status-warning border border-status-warning/20"
            : "text-text-muted hover:text-foreground"
        }`}
      >
        {!isLive && (
          <span className="h-1.5 w-1.5 rounded-full bg-status-warning shrink-0" />
        )}
        Sandbox
      </button>
      <button
        onClick={() => setEnvironment("live")}
        className={`flex items-center gap-1.5 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
          isLive
            ? "bg-status-success/10 text-status-success border border-status-success/20"
            : "text-text-muted hover:text-foreground"
        }`}
      >
        {isLive && (
          <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse shrink-0" />
        )}
        Live
      </button>
    </div>
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
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-navy/80 backdrop-blur-xl px-4 lg:px-8 gap-2 sm:gap-4">
      {/* ── Left: Hamburger + Logo (mobile) + Breadcrumb ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-text-muted hover:text-foreground transition-colors cursor-pointer p-1 rounded-md hover:bg-secondary"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md text-text-muted hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
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
          <Image src="/logo.svg" alt="Herald Logo" width={22} height={22} className="h-[22px] w-[22px] object-contain shrink-0" />
          <span className="hidden sm:inline-block text-base font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Syne", system-ui, sans-serif' }}>Herald</span>
        </div>

        {/* Breadcrumb — desktop */}
        <Breadcrumb pathname={pathname} />
      </div>

      {/* ── Right: env switcher, theme, user ── */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <EnvSwitcher
          activeEnvironment={activeEnvironment}
          setEnvironment={setEnvironment}
        />

        <ThemeToggle />

        <div className="h-4 w-px bg-border" />

        {/* User dropdown */}
        <div className="flex items-center gap-2">
          <UserAvatar userId={session?.user?.id} />
          <span className="hidden sm:inline text-sm text-text-muted">
            {session?.user?.id
              ? `${session.user.id.slice(0, 4)}…${session.user.id.slice(-4)}`
              : "user..."}
          </span>
          <svg className="hidden sm:block h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  );
}