"use client";

import { useUiStore } from "@/lib/stores/ui.store";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiLogOut, FiSettings, FiUsers } from "react-icons/fi";
import { Bell, ShieldCheck, Copy, Check } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ChangelogDrawer } from "@/components/changelog/ChangelogDrawer";
import { DocsDrawer } from "@/components/docs/DocsDrawer";
import { getUnreadCount } from "@/lib/changelog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProtocol } from "@/lib/api/protocol";
import { cn } from "@/lib/utils";

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
  support: "Support",
  settings: "Settings",
  campaigns: "Campaigns",
  scheduled: "Scheduled",
  requests: "Request Inspector",
  engagement: "Engagement",
};

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg) => ({
    label: ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: `/${seg}`,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden sm:flex items-center gap-1.5"
    >
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

// ─── Helpers ────────────────────────────────────────────────

function getInitials(name?: string | null, fallback?: string | null): string {
  if (name) {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (fallback) return fallback.slice(0, 2).toUpperCase();
  return "P";
}

const TIER_LABELS: Record<number, string> = {
  0: "Developer",
  1: "Growth",
  2: "Scale",
  3: "Enterprise",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  developer: "Developer",
  read_only: "Read-only",
};

// ─── Avatar ─────────────────────────────────────────────────

function UserAvatar({ initials, logoUrl }: { initials: string; logoUrl?: string | null }) {
  return (
    <div className="relative h-8 w-8 shrink-0 cursor-pointer select-none">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Protocol logo"
          className="h-8 w-8 rounded-full object-cover border border-border/40"
          onError={(e) => {
            // If image fails to load, hide it so the initials fallback shows
            (e.currentTarget as HTMLImageElement).style.display = "none";
            (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
          }}
        />
      ) : null}
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-navy"
        style={{
          background: "linear-gradient(135deg, #00c896 0%, #00e5a8 100%)",
          display: logoUrl ? "none" : "flex",
        }}
      >
        {initials}
      </div>
      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green border-2 border-navy" />
    </div>
  );
}

// ─── Copy button for wallet address ─────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-text-muted hover:text-teal transition-colors"
      title="Copy wallet address"
    >
      {copied ? (
        <Check className="h-3 w-3 text-teal" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
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
    openChangelog,
    lastReadChangelog,
    toggleDocs,
  } = useUiStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const unreadCount = getUnreadCount(lastReadChangelog);
  const queryClient = useQueryClient();

  const { data: protocol } = useQuery({
    queryKey: ["protocol"],
    queryFn: getProtocol,
    staleTime: 5 * 60 * 1000,
    enabled: !!session?.user,
  });

  const protocolName = protocol?.protocolName ?? protocol?.name ?? null;
  const walletAddress = session?.user?.walletAddress ?? null;
  const role = session?.user?.role ?? "owner";
  const tier = protocol?.tier ?? session?.user?.tier ?? 0;
  const initials = getInitials(protocolName, walletAddress);
  const tierLabel = TIER_LABELS[tier] ?? "Developer";
  const roleLabel = ROLE_LABELS[role] ?? "Owner";
  const isVerified = protocol?.verificationStatus === "VERIFIED";

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  const handleEnvSwitch = (env: "sandbox" | "live") => {
    if (env === activeEnvironment) return;
    setEnvironment(env);
    queryClient.invalidateQueries();
    toast.info(
      env === "sandbox"
        ? "Switched to Sandbox — showing test data"
        : "Switched to Live — showing production data",
      { duration: 3000 }
    );
  };

  // Ctrl+/ opens docs drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        toggleDocs();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleDocs]);

  return (
    <>
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-navy/80 backdrop-blur-xl px-4 lg:px-8 gap-2 sm:gap-4">
      {/* ── Left: Hamburger + Logo (mobile) + Breadcrumb ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-text-muted hover:text-foreground transition-colors cursor-pointer p-1 rounded-md hover:bg-secondary"
          aria-label="Toggle sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md text-text-muted hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          title={
            desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
          }
          aria-label={
            desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
          }
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                desktopSidebarCollapsed
                  ? "M4 6h16M4 12h16M4 18h16"
                  : "M4 6h16M4 12h8m-8 6h16"
              }
            />
          </svg>
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <Image
            src="/logo.svg"
            alt="Herald Logo"
            width={22}
            height={22}
            className="h-[22px] w-[22px] object-contain shrink-0"
          />
          <span className="hidden sm:inline-block text-base font-heading font-extrabold tracking-tight text-foreground">
            Herald
          </span>
        </div>

        {/* Breadcrumb — desktop */}
        <Breadcrumb pathname={pathname} />
      </div>

      {/* ── Right: env switcher, theme, user ── */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <EnvSwitcher
          activeEnvironment={activeEnvironment}
          setEnvironment={handleEnvSwitch}
        />

        {/* Docs quick reference */}
        <button
          onClick={toggleDocs}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-foreground hover:bg-secondary transition-colors font-bold text-sm"
          aria-label="Quick Reference (Ctrl+/)"
          title="Quick Reference (Ctrl+/)"
        >
          ?
        </button>

        {/* Changelog bell */}
        <button
          onClick={openChangelog}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="What's new"
          title="What's new"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal" />
          )}
        </button>

        <ThemeToggle />

        <div className="h-4 w-px bg-border" />

        {/* User dropdown */}
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-secondary p-1 rounded-lg transition-colors cursor-pointer outline-hidden">
              <UserAvatar initials={initials} logoUrl={protocol?.logoUrl} />
              <div className="hidden sm:flex flex-col items-start min-w-0">
                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                  {protocolName ?? shortWallet ?? "My Protocol"}
                </span>
                <span className="text-[10px] text-text-muted leading-tight">
                  {roleLabel} · {tierLabel}
                </span>
              </div>
              <svg
                className="hidden sm:block h-4 w-4 text-text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 bg-navy border-border/60 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl p-1.5 rounded-2xl"
            >
              {/* ── Identity header ── */}
              <DropdownMenuLabel className="px-1.5 py-1.5 mb-1">
                <div className="p-3 rounded-xl bg-card-2/30 border border-border/20 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-teal/5 rounded-full -mr-8 -mt-8 blur-xl" />

                  {/* Protocol name + verification */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {protocol?.logoUrl && (
                        <img
                          src={protocol.logoUrl}
                          alt="Protocol logo"
                          className="h-8 w-8 rounded-lg object-cover border border-border/30 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate leading-tight">
                          {protocolName ?? "Unnamed Protocol"}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Protocol account
                        </p>
                      </div>
                    </div>
                    {isVerified && (
                      <div
                        className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal/10 border border-teal/20"
                        title="Verified protocol"
                      >
                        <ShieldCheck className="h-3 w-3 text-teal" />
                        <span className="text-[10px] font-semibold text-teal">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Role + Tier badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-foreground border border-border/40">
                      {roleLabel}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        tier === 0
                          ? "bg-secondary text-text-muted border-border/40"
                          : tier === 1
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : tier === 2
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}
                    >
                      {tierLabel}
                    </span>
                  </div>

                  {/* Wallet address */}
                  {walletAddress && (
                    <div className="flex items-center gap-1.5 pt-0.5 border-t border-border/20">
                      <span className="text-[10px] text-text-muted">Wallet</span>
                      <code className="text-[10px] font-mono text-foreground/70 truncate flex-1">
                        {shortWallet}
                      </code>
                      <CopyButton text={walletAddress} />
                    </div>
                  )}

                  {/* Protocol ID */}
                  {session?.user?.protocolId && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-text-muted">Protocol ID</span>
                      <code className="text-[10px] font-mono text-foreground/70 truncate flex-1">
                        {session.user.protocolId.slice(0, 8)}…
                      </code>
                      <CopyButton text={session.user.protocolId} />
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>

              {/* ── Menu items ── */}
              <div className="space-y-0.5">
                <DropdownMenuItem
                  className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-xl focus:bg-secondary focus:text-foreground transition-all duration-200"
                  onClick={() => (window.location.href = "/settings")}
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-text-muted">
                    <FiSettings className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Settings</span>
                    <span className="text-[10px] text-text-muted">
                      Protocol & preferences
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-xl focus:bg-secondary focus:text-foreground transition-all duration-200"
                  onClick={() => (window.location.href = "/team")}
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-text-muted">
                    <FiUsers className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Team</span>
                    <span className="text-[10px] text-text-muted">
                      Members & roles
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-3 px-2 py-1.5 cursor-pointer rounded-xl focus:bg-secondary focus:text-foreground transition-all duration-200"
                  onClick={() => (window.location.href = "/billing")}
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-text-muted">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Billing & Plan</span>
                    <span className="text-[10px] text-text-muted">
                      Usage & upgrades
                    </span>
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
                  <span className="text-xs font-semibold">Sign out</span>
                  <span className="text-[10px] opacity-70">
                    End your session
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>

    <ChangelogDrawer />
    <DocsDrawer />
    </>
  );
}
