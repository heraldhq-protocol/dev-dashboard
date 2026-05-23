"use client";

import { useEffect, useState } from "react";
import { NextStepProvider, NextStep, type Tour, type Step } from "nextstepjs";
import { useSession } from "next-auth/react";
import { TourCard } from "@/components/onboarding/TourCard";
import { TourInitializer } from "@/components/onboarding/TourInitializer";
import { useOnboardingStore, TOUR_VERSION } from "@/lib/stores/onboarding.store";
import { updateProtocol } from "@/lib/api/protocol";

// ── Extended step type ────────────────────────────────────────────────────────
export type GroupedStep = Step & {
  group?: string;
  groupStep?: number;
  groupTotal?: number;
};

// ── annotateGroups ────────────────────────────────────────────────────────────
function annotateGroups(rawSteps: GroupedStep[]): GroupedStep[] {
  const groupCounts: Record<string, number> = {};
  for (const step of rawSteps) {
    const g = step.group ?? "__ungrouped__";
    groupCounts[g] = (groupCounts[g] ?? 0) + 1;
  }
  const groupCounters: Record<string, number> = {};
  return rawSteps.map((step) => {
    const g = step.group ?? "__ungrouped__";
    groupCounters[g] = (groupCounters[g] ?? 0) + 1;
    return { ...step, groupStep: groupCounters[g], groupTotal: groupCounts[g] } as GroupedStep;
  });
}

// ── useIsMobile ───────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// Sidebar is a hidden drawer below lg (1024px) — its IDs are not in the layout flow
function useIsSidebarHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setHidden(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHidden(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return hidden;
}

// ── buildTourSteps ────────────────────────────────────────────────────────────
function buildTourSteps(isSidebarHidden: boolean, isPaidTier: boolean): Tour[] {
  // Sidebar IDs only exist in layout flow on lg+ screens
  const sel = (id: string): string | undefined => (isSidebarHidden ? undefined : id);
  // Gated pages (Domains content, Team content) only render real UI for Growth+
  const gated = (id: string): string | undefined => (isPaidTier ? id : undefined);

  // Shared pointer styles
  const ptr = { pointerPadding: 8, pointerRadius: 10 };
  // In-page: same pointer styles, scroll-margin-top handles TopNav offset via CSS
  // viewportID tells NextStep to position relative to the dashboard scroll container
  const inPage = { ...ptr, viewportID: "dashboard-viewport" };

  const raw: GroupedStep[] = [
    // ── Getting Started ────────────────────────────────────────────────────
    {
      group: "Getting Started",
      icon: "👋",
      title: "Welcome to Herald",
      content:
        "Herald is your developer control panel for sending wallet-native notifications to any Solana address — via Telegram, Email, and SMS.\n\nThis tour walks you through every section so you're ready to ship in minutes.",
      selector: undefined,
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...ptr,
    },

    // ── Overview ──────────────────────────────────────────────────────────
    {
      group: "Overview",
      icon: "📊",
      title: "Your Command Centre",
      content:
        "The Overview page is your real-time pulse on the Herald network. Everything your protocol sends flows through here.",
      selector: sel("#sidebar-overview"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
    },
    {
      group: "Overview",
      icon: "🟢",
      title: "Network Status",
      content:
        "This strip shows live Herald network health. If any delivery service is degraded, it turns amber or red — so you catch issues before your users do.",
      selector: "#overview-status-strip",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Overview",
      icon: "📈",
      title: "KPI Metrics",
      content:
        "Four live counters: Total Sends, Delivery Rate, Average Latency, and Active Webhooks. Each shows a sparkline trend so you can spot drops at a glance.",
      selector: "#overview-metrics",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Overview",
      icon: "📉",
      title: "Volume Chart",
      content:
        "An area chart of your daily notification volume. Toggle between 7-day and 30-day views. Hover any point to see exact send counts for that day.",
      selector: "#overview-volume-chart",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Overview",
      icon: "🚨",
      title: "Recent Failures",
      content:
        "Failed notifications surface here with the recipient wallet, channel, and error reason. Click 'View all logs →' to open the full history with filtering.",
      selector: "#overview-failures",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/playground",
    },

    // ── Playground ────────────────────────────────────────────────────────
    {
      group: "Playground",
      icon: "🧪",
      title: "Playground",
      content:
        "Compose and preview notifications before going live — no API calls, no code needed. It's the fastest way to validate your message content.",
      selector: sel("#sidebar-playground"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/overview",
    },
    {
      group: "Playground",
      icon: "📡",
      title: "Channel Selector",
      content:
        "Switch between Email, Telegram, and SMS using the tabs at the top of the composer. Content is saved independently per channel so you can draft all three at once.",
      selector: "#playground-channel-toggle",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Playground",
      icon: "✍️",
      title: "Composer + Live Preview",
      content:
        "Left panel: write your notification with markdown and variable support (e.g. {{wallet_address}}). Right panel: real-time preview of exactly how it will appear to recipients.",
      selector: "#playground-composer",
      side: "left",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Playground",
      icon: "🚀",
      title: "Send Test",
      content:
        "Hit 'Send Test' to fire the notification to a real recipient right now. You'll be prompted for a wallet, email, or Telegram ID. Delivery uses your sandbox API key automatically.",
      selector: "#playground-send-btn",
      side: "bottom-right",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/api-keys",
    },

    // ── API Keys ──────────────────────────────────────────────────────────
    {
      group: "API Keys",
      icon: "🔑",
      title: "API Keys",
      content:
        "API Keys are how your backend authenticates with the Herald gateway. Every notification you send must include a key in the Authorization header.",
      selector: sel("#sidebar-api-keys"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/playground",
    },
    {
      group: "API Keys",
      icon: "⚠️",
      title: "Security Warning",
      content:
        "Live keys bypass the sandbox and perform real actions. Never put them in client-side code or commit them to git. Use environment variables only.",
      selector: "#apikeys-security-banner",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "API Keys",
      icon: "🟢",
      title: "Live Keys",
      content:
        "Live keys (hrld_live_...) send real notifications to real wallets. Create one when you're ready to go live. The key is shown only once — copy it immediately.",
      selector: "#apikeys-live-section",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "API Keys",
      icon: "🟡",
      title: "Sandbox (Test) Keys",
      content:
        "Test keys (hrld_test_...) route all notifications to your sandbox contacts instead of real wallets. Perfect for development. Configure them in Settings → Sandbox.",
      selector: "#apikeys-test-section",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "API Keys",
      icon: "➕",
      title: "Create a Key",
      content:
        "Click 'Create Key' to open the modal. Choose a name, environment (live vs. test), and permission scopes.",
      selector: "#create-api-key-btn",
      side: "bottom-right",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/webhooks",
    },

    // ── Webhooks ──────────────────────────────────────────────────────────
    {
      group: "Webhooks",
      icon: "⚡",
      title: "Webhooks",
      content:
        "Webhooks let your backend receive real-time HTTP callbacks whenever Herald emits a delivery event. Use them to trigger retries, update your DB, or fire alerts.",
      selector: sel("#sidebar-webhooks"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/api-keys",
    },
    {
      group: "Webhooks",
      icon: "📋",
      title: "Endpoint List",
      content:
        "All your registered endpoints appear here with URL, active toggle, and a 'View Logs' button. Disable endpoints without deleting them — useful during maintenance windows.",
      selector: "#webhooks-list",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Webhooks",
      icon: "🔗",
      title: "Adding an Endpoint",
      content:
        "Click 'Add Endpoint' to register a URL. Subscribe to events: notification.sent, notification.failed, notification.bounced, apikey.created, apikey.revoked. Herald POSTs a signed payload for each.",
      selector: "#webhooks-add-btn",
      side: "bottom-right",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/templates",
    },

    // ── Templates ─────────────────────────────────────────────────────────
    {
      group: "Templates",
      icon: "📝",
      title: "Templates",
      content:
        "Pre-define notification content with dynamic variables. Reference a template by ID in your API call — Herald substitutes variables at send time so every message is personalised.",
      selector: sel("#sidebar-templates"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/webhooks",
    },
    {
      group: "Templates",
      icon: "✏️",
      title: "Template Library",
      content:
        "All your saved templates appear here as cards showing name, category (DeFi, Governance, Marketing, System), version, and last updated date. Click 'Edit' to open the HTML editor.",
      selector: "#templates-list",
      side: "top",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Templates",
      icon: "➕",
      title: "Create a Template",
      content:
        "Click 'Create Template' to open the editor. Write raw HTML with Herald variables like {{protocolName}} and {{body}}, preview it with real data, then save. Requires Growth tier or higher.",
      selector: "#templates-create-btn",
      side: "bottom-right",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/domains",
    },

    // ── Domains ───────────────────────────────────────────────────────────
    {
      group: "Domains",
      icon: "🌐",
      title: "Email Domains",
      content:
        "Verify your domain to send branded emails from your own address (e.g. alerts@yourprotocol.com). Without verification, emails fall back to the Herald shared sending domain.",
      selector: sel("#sidebar-domains"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/templates",
    },
    {
      group: "Domains",
      icon: "🔑",
      title: "Domain DKIM Setup",
      content: isPaidTier
        ? "When you add a domain, Herald generates a DKIM TXT record. Add it to your DNS provider (Cloudflare, Vercel, GoDaddy, etc.) and click Verify. DNS propagation takes 5-30 minutes."
        : "When you add a domain, Herald generates a DKIM TXT record. Add it to your DNS provider and click Verify.\n\n🔒 Custom domain sending is available on Growth tier and above.",
      selector: gated("#domains-list"),
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...(isPaidTier ? inPage : ptr),
    },
    {
      group: "Domains",
      icon: "➕",
      title: "Add Your Domain",
      content: isPaidTier
        ? "Click 'Add Domain' and enter your sending subdomain (e.g. alerts.myprotocol.com). After verification, emails you send will show your domain in the From header — boosting trust and deliverability."
        : "Click 'Add Domain' to register a verified sending domain. Upgrade to Growth or above to unlock this feature and send from your own domain.",
      selector: gated("#domains-add-btn"),
      side: "bottom-right",
      showControls: true,
      showSkip: true,
      ...(isPaidTier ? inPage : ptr),
      nextRoute: "/notifications",
    },

    // ── Notifications ─────────────────────────────────────────────────────
    {
      group: "Notifications",
      icon: "🔔",
      title: "Notification Log",
      content:
        "Every notification Herald has ever attempted — searchable and filterable. Identify exactly what was sent, to whom, and whether it was delivered, failed, or bounced.",
      selector: sel("#sidebar-notifications"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/domains",
    },
    {
      group: "Notifications",
      icon: "🔍",
      title: "Filters & Search",
      content:
        "Search by wallet address or notification ID. Filter by Status (Delivered, Failed, Queued) or Category (DeFi, Governance, Marketing, System). Results update instantly.",
      selector: "#notifications-filters",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Notifications",
      icon: "📋",
      title: "Log Table",
      content:
        "Each row shows the wallet, channel, status badge, and timestamp. Click any row to open the detail drawer with the full payload, delivery receipt, and error trace if it failed.",
      selector: "#notifications-table",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/billing",
    },

    // ── Billing ───────────────────────────────────────────────────────────
    {
      group: "Billing",
      icon: "💳",
      title: "Billing & Usage",
      content:
        "Monitor notification usage against your plan limits, manage your subscription, and download invoices. Upgrade before hitting quotas to avoid delivery delays.",
      selector: sel("#sidebar-billing"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/notifications",
    },
    {
      group: "Billing",
      icon: "📊",
      title: "Current Plan",
      content:
        "Your active plan and current period usage. The progress bar shows how many notifications you've used vs. your limit. When you approach 80%, Herald shows a soft warning.",
      selector: "#billing-current-plan",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Billing",
      icon: "📦",
      title: "Compare Plans",
      content:
        "Developer (free), Growth ($99/mo), Scale ($299/mo), and Enterprise. Each tier unlocks more sends per month, reduced latency, additional webhook endpoints, and dedicated support.",
      selector: "#billing-plans",
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...inPage,
    },
    {
      group: "Billing",
      icon: "⚡",
      title: "Overage Management",
      content:
        "If you exceed your plan limit mid-period, Herald can automatically top up with overage packs instead of dropping messages. Configure your overage budget here.",
      selector: "#billing-overage",
      side: "top",
      showControls: true,
      showSkip: true,
      ...inPage,
      nextRoute: "/team",
    },

    // ── Team ──────────────────────────────────────────────────────────────
    {
      group: "Team",
      icon: "👥",
      title: "Team Management",
      content:
        "Invite teammates and assign roles to control exactly what each person can do. Roles include Owner, Admin, Developer (API keys & logs only), and Read Only (analytics only).",
      selector: sel("#sidebar-team"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
      prevRoute: "/billing",
    },
    {
      group: "Team",
      icon: "🛡️",
      title: "Members & Roles",
      content: isPaidTier
        ? "The table shows each member's email, wallet address, role, account status, and last activity. Change roles inline via the dropdown — changes take effect immediately."
        : "The members table shows each person's email, wallet, role, and last activity. Role changes take effect immediately.\n\n🔒 Team management is available on Growth tier and above.",
      selector: gated("#team-members-table"),
      side: "bottom",
      showControls: true,
      showSkip: true,
      ...(isPaidTier ? inPage : ptr),
    },
    {
      group: "Team",
      icon: "✉️",
      title: "Invite a Member",
      content: isPaidTier
        ? "Click 'Invite New Member', enter their email, and select a role. They receive an invitation email with a one-click setup link. Seat limits depend on your billing tier."
        : "Click 'Invite New Member' to add teammates with granular roles — Owner, Admin, Developer, or Read Only. Upgrade to Growth or above to enable team access.",
      selector: gated("#team-invite-btn"),
      side: "bottom-right",
      showControls: true,
      showSkip: true,
      ...(isPaidTier ? inPage : ptr),
    },

    // ── Settings ──────────────────────────────────────────────────────────
    {
      group: "Settings",
      icon: "⚙️",
      title: "Settings",
      content:
        "Configure protocol identity — logo, website, sender name. Manage sandbox test contacts, brand assets, and Telegram button limits. Restart this tour anytime from Settings → Tour & Onboarding.",
      selector: sel("#sidebar-settings"),
      side: "right",
      showControls: true,
      showSkip: true,
      ...ptr,
    },

    // ── Done ──────────────────────────────────────────────────────────────
    {
      group: "Done!",
      icon: "🚀",
      title: "You're all set!",
      content:
        "You've seen everything Herald has to offer. Your next steps:\n\n1. Create a sandbox API key\n2. Send a test notification in the Playground\n3. Register a webhook to receive delivery events\n\nWelcome to Herald. 🎉",
      selector: undefined,
      side: "bottom",
      showControls: true,
      showSkip: false,
      ...ptr,
    },
  ];

  return [
    {
      tour: "heraldMainTour",
      steps: annotateGroups(raw) as Step[],
    },
  ];
}

// ── NextStepInner ─────────────────────────────────────────────────────────────

function NextStepInner({ children, isSidebarHidden, isPaidTier }: { children: React.ReactNode; isSidebarHidden: boolean; isPaidTier: boolean }) {
  const { setTourCompleted, setTourSkipped, setLastTourStep } = useOnboardingStore();
  const steps = buildTourSteps(isSidebarHidden, isPaidTier);

  return (
    <NextStep
      steps={steps}
      cardComponent={TourCard}
      shadowRgb="6, 13, 24"
      shadowOpacity="0.85"
      displayArrow
      scrollToTop={false}
      onComplete={() => {
        setTourCompleted();
        updateProtocol({ registrationFlags: { tourCompleted: true, tourVersion: TOUR_VERSION } }).catch(() => {});
      }}
      onSkip={() => {
        setTourSkipped();
        updateProtocol({ registrationFlags: { tourCompleted: true, tourVersion: TOUR_VERSION } }).catch(() => {});
      }}
      onStepChange={(step) => setLastTourStep(step)}
    >
      {/* TourInitializer lives here so it is always inside NextStepProvider context
          and is never rendered on mobile (NextStepInner is skipped on mobile). */}
      <TourInitializer />
      {children}
    </NextStep>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isSidebarHidden = useIsSidebarHidden();
  const { data: session } = useSession();
  // Tier 0 = Developer (free). Growth (1) and above unlock gated tour steps.
  const isPaidTier = (session?.user?.tier ?? 0) >= 1;

  // Tour is skipped entirely on phones — no targets exist and layout is too narrow
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <NextStepProvider>
      <NextStepInner isSidebarHidden={isSidebarHidden} isPaidTier={isPaidTier}>{children}</NextStepInner>
    </NextStepProvider>
  );
}
