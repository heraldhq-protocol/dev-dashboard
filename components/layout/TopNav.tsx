"use client";

import { useUiStore } from "@/lib/stores/ui.store";
import { useSession, signOut } from "next-auth/react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";

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
          <span className="hidden sm:inline-block text-base font-heading font-extrabold tracking-tight text-foreground">Herald</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-secondary p-1 rounded-lg transition-colors cursor-pointer outline-hidden">
            <UserAvatar userId={session?.user?.id} />
            <span className="hidden sm:inline text-sm text-text-muted">
              {session?.user?.id
                ? `${session.user.id.slice(0, 4)}…${session.user.id.slice(-4)}`
                : "user..."}
            </span>
            <svg className="hidden sm:block h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-navy border-border/60 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl p-1.5 rounded-2xl">
            <DropdownMenuLabel className="px-1.5 py-1.5 mb-1">
              <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-card-2/30 border border-border/20 relative overflow-hidden group/header">
                <div className="absolute top-0 right-0 w-12 h-12 bg-teal/5 rounded-full -mr-6 -mt-6 blur-xl group-hover/header:bg-teal/10 transition-colors" />
                <span className="text-[9px] text-teal font-bold uppercase tracking-[0.2em]">Authorized</span>
                <span className="text-xs font-mono text-foreground truncate">
                  {session?.user?.id 
                    ? `${session.user.id.slice(0, 8)}...${session.user.id.slice(-6)}` 
                    : "Unknown"}
                </span>
              </div>
            </DropdownMenuLabel>
            
            <div className="space-y-0.5">
              <DropdownMenuItem 
                className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-xl focus:bg-secondary focus:text-foreground transition-all duration-200"
                onClick={() => window.location.href = '/settings'}
              >
                <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-text-muted">
                  <FiSettings className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Settings</span>
                  <span className="text-[9px] text-text-muted">Preferences & keys</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-xl focus:bg-secondary focus:text-foreground transition-all duration-200"
                onClick={() => window.location.href = '/team'}
              >
                <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-text-muted">
                  <FiUser className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Team</span>
                  <span className="text-[9px] text-text-muted">Members & roles</span>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-border/40 my-1.5" />
            
            <DropdownMenuItem 
              className="flex items-center gap-3 px-2 py-1.5 text-red focus:bg-red/10 focus:text-red cursor-pointer rounded-xl transition-all duration-200"
              onClick={() => signOut()}
            >
              <div className="w-7 h-7 rounded-lg bg-red/10 flex items-center justify-center">
                <FiLogOut className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Log out</span>
                <span className="text-[9px] opacity-70">End session</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}