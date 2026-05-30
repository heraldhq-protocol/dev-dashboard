/**
 * Sandbox data generators — called fresh on every render so numbers change
 * each time the user switches to Sandbox mode.  All values are realistic
 * ranges chosen to look like a growing protocol in early traction.
 */

import { subDays, subHours, subMinutes, format } from "date-fns";
import type {
  DashboardStats,
  AnalyticsTrends,
  AudienceAnalytics,
  EngagementMetrics,
} from "@/lib/api/analytics";
import type { WebhookReliabilityResponse } from "@/lib/api/webhooks";
import type { NotificationDto, PaginatedNotifications } from "@/types/api";
import type { Campaign } from "@/lib/api/campaigns";
import type { Audience } from "@/lib/api/audiences";

// ── Primitive helpers ─────────────────────────────────────────────────────────

/** Random integer in [min, max] */
function ri(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float rounded to `dp` decimal places in [min, max] */
function rf(min: number, max: number, dp = 2) {
  return +((Math.random() * (max - min) + min).toFixed(dp));
}

/** Random element from array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Dashboard (Overview) ──────────────────────────────────────────────────────

export function sandboxDashboardStats(): DashboardStats {
  return {
    sendsThisPeriod:        ri(1_200, 8_500),
    activeApiKeys:          ri(2, 6),
    activeWebhooks:         ri(1, 5),
    deliverySuccessRate:    rf(94.5, 99.4, 1),
    recentNotifications:    ri(20, 120),
    averageLatencyMs:       ri(90, 280),
    queryTime:              `${ri(2, 15)}ms`,
  };
}

// ── Analytics trends ──────────────────────────────────────────────────────────

export function sandboxAnalyticsTrends(days: number): AnalyticsTrends {
  const categories = ["defi", "governance", "marketing", "security"];

  // Daily volume: gently trending upward with noise
  const base = ri(40, 200);
  const dailyVolume = Array.from({ length: days }, (_, i) => {
    const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    const noise = ri(-15, 30);
    const trend = Math.floor(i * 0.8);
    return { date, volume: Math.max(1, base + noise + trend) };
  });

  const totalVolume = dailyVolume.reduce((s, d) => s + d.volume, 0);
  const failed = Math.floor(totalVolume * rf(0.005, 0.03, 3));
  const queued = Math.floor(totalVolume * rf(0.01, 0.04, 3));

  const statusBreakdown = [
    { status: "delivered", _count: { id: totalVolume - failed - queued } },
    { status: "failed",    _count: { id: failed } },
    { status: "queued",    _count: { id: queued } },
  ];

  // Random category split
  let remaining = totalVolume;
  const categoryBreakdown = categories.map((category, i) => {
    if (i === categories.length - 1) return { category, _count: { id: remaining } };
    const share = Math.floor(remaining * rf(0.1, 0.4, 3));
    remaining -= share;
    return { category, _count: { id: share } };
  });

  // Per-channel daily volume: email carries the bulk, telegram moderate, sms sparse
  const dailyVolumeByChannel = dailyVolume.map((d) => {
    const total = d.volume;
    const email    = Math.floor(total * rf(0.50, 0.65, 3));
    const telegram = Math.floor(total * rf(0.25, 0.38, 3));
    const sms      = Math.max(0, total - email - telegram);
    return { date: d.date, email, telegram, sms };
  });

  return { statusBreakdown, categoryBreakdown, timeframeDays: days, totalVolume, dailyVolume, dailyVolumeByChannel };
}

// ── Engagement metrics ────────────────────────────────────────────────────────

export function sandboxEngagementMetrics(): EngagementMetrics {
  const totalSends   = ri(300, 1_200);
  const opens        = Math.floor(totalSends * rf(0.28, 0.52, 3));
  const clicks       = Math.floor(opens     * rf(0.08, 0.18, 3));
  const unsubscribes = Math.floor(totalSends * rf(0.002, 0.012, 4));

  const safeRate = (n: number) => +(((n / totalSends) * 100).toFixed(2));

  const now  = new Date();
  const from = subDays(now, 30);

  return {
    totalSends,
    opens,
    clicks,
    unsubscribes,
    openRate:        safeRate(opens),
    clickRate:       safeRate(clicks),
    unsubscribeRate: safeRate(unsubscribes),
    period: {
      from: from.toISOString(),
      to:   now.toISOString(),
    },
  };
}

// ── Audience analytics ────────────────────────────────────────────────────────

export function sandboxAudienceAnalytics(): AudienceAnalytics {
  const totalRegistered        = ri(800, 6_000);
  const broadcastable          = Math.floor(totalRegistered * rf(0.72, 0.92, 3));
  const activeLastThirtyDays   = Math.floor(broadcastable   * rf(0.40, 0.75, 3));
  const retentionRate          = rf(68, 94, 1);

  const emailPct    = rf(0.55, 0.80, 3);
  const telegramPct = rf(0.10, 0.30, 3);
  const smsPct      = Math.max(0, 1 - emailPct - telegramPct);

  const channelCoverage = {
    email:    Math.floor(totalRegistered * emailPct),
    telegram: Math.floor(totalRegistered * telegramPct),
    sms:      Math.floor(totalRegistered * smsPct),
  };

  const sources = ["sdk", "widget", "api", "csv"];
  let sourceRemaining = totalRegistered;
  const bySource: Record<string, number> = {};
  sources.forEach((src, i) => {
    if (i === sources.length - 1) { bySource[src] = sourceRemaining; return; }
    const n = Math.floor(sourceRemaining * rf(0.15, 0.50, 3));
    bySource[src] = n;
    sourceRemaining -= n;
  });

  // 90-day registration trend with gentle growth
  const trendBase = Math.floor(totalRegistered * 0.004);
  const registrationTrend = Array.from({ length: 90 }, (_, i) => {
    const date  = format(subDays(new Date(), 89 - i), "yyyy-MM-dd");
    const count = Math.max(0, trendBase + ri(-2, 8) + Math.floor(i * 0.05));
    return { date, count };
  });

  return {
    totalRegistered,
    broadcastableSubscribers: broadcastable,
    activeLastThirtyDays,
    retentionRate,
    channelCoverage,
    bySource,
    registrationTrend,
  };
}

// ── Templates ─────────────────────────────────────────────────────────────────

interface SandboxTemplate {
  id: string;
  name: string;
  category: string;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  subjectTemplate: string;
  previewText: string;
  isDefault: boolean;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export function sandboxTemplates(): SandboxTemplate[] {
  const now = new Date();
  const entries: Array<Omit<SandboxTemplate, "id" | "createdAt" | "updatedAt">> = [
    {
      name: "Liquidation Risk Alert",
      category: "defi",
      status: "APPROVED",
      subjectTemplate: "{{protocolName}} — Liquidation Risk Alert",
      previewText: "Your position health factor has dropped below the safe threshold.",
      isDefault: true,
      isActive: true,
      version: 2,
    },
    {
      name: "Governance Vote Reminder",
      category: "governance",
      status: "APPROVED",
      subjectTemplate: "Vote Now: {{subject}}",
      previewText: "A governance proposal is open for voting. Cast your vote before the deadline.",
      isDefault: false,
      isActive: true,
      version: 1,
    },
    {
      name: "Yield Opportunity",
      category: "marketing",
      status: "PENDING_REVIEW",
      subjectTemplate: "New Yield: {{subject}}",
      previewText: "A new high-yield opportunity is available in your portfolio.",
      isDefault: false,
      isActive: false,
      version: 1,
    },
    {
      name: "Security Notice",
      category: "defi",
      status: "DRAFT",
      subjectTemplate: "⚠ Security Notice from {{protocolName}}",
      previewText: "Important security update requiring your attention.",
      isDefault: false,
      isActive: false,
      version: 1,
    },
  ];

  return entries.slice(0, ri(2, entries.length)).map((e, i) => ({
    ...e,
    id: `sandbox-tpl-${i}`,
    createdAt: subDays(now, ri(5, 60)).toISOString(),
    updatedAt: subDays(now, ri(0, 4)).toISOString(),
  }));
}

// ── Scheduled notifications ───────────────────────────────────────────────────

interface SandboxScheduled {
  id: string;
  protocolId: string;
  wallet?: string;
  subject: string;
  body: string;
  category: string;
  scheduleType: "ONE_TIME" | "RECURRING";
  cronExpr?: string;
  timezone: string;
  nextRunAt: string;
  lastRunAt?: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "CANCELLED" | "FAILED";
  createdAt: string;
}

export function sandboxScheduledNotifications(
  page = 1,
): { items: SandboxScheduled[]; total: number } {
  const now = new Date();

  const pool: SandboxScheduled[] = [
    {
      id: "sandbox-sched-0",
      protocolId: "sandbox-protocol",
      wallet: fakeWallet(),
      subject: "Weekly Governance Digest",
      body: "Your weekly summary of active governance proposals.",
      category: "governance",
      scheduleType: "RECURRING",
      cronExpr: "0 9 * * MON",
      timezone: "UTC",
      nextRunAt: subDays(now, -2).toISOString(),   // 2 days from now
      lastRunAt: subDays(now, 5).toISOString(),
      status: "PENDING",
      createdAt: subDays(now, 30).toISOString(),
    },
    {
      id: "sandbox-sched-1",
      protocolId: "sandbox-protocol",
      wallet: fakeWallet(),
      subject: "DeFi Position Health Check",
      body: "Automated health check for open lending positions.",
      category: "defi",
      scheduleType: "RECURRING",
      cronExpr: "0 */6 * * *",
      timezone: "UTC",
      nextRunAt: subHours(now, -3).toISOString(),  // 3 hours from now
      lastRunAt: subHours(now, 3).toISOString(),
      status: "RUNNING",
      createdAt: subDays(now, 14).toISOString(),
    },
    {
      id: "sandbox-sched-2",
      protocolId: "sandbox-protocol",
      wallet: fakeWallet(),
      subject: "Token Unlock Reminder",
      body: "Your vested tokens are scheduled to unlock in 24 hours.",
      category: "defi",
      scheduleType: "ONE_TIME",
      timezone: "UTC",
      nextRunAt: subDays(now, -1).toISOString(),   // tomorrow
      status: "PENDING",
      createdAt: subDays(now, 7).toISOString(),
    },
    {
      id: "sandbox-sched-3",
      protocolId: "sandbox-protocol",
      subject: "Monthly Protocol Report",
      body: "Protocol performance summary for the month.",
      category: "marketing",
      scheduleType: "RECURRING",
      cronExpr: "0 8 1 * *",
      timezone: "UTC",
      nextRunAt: subDays(now, -15).toISOString(),
      lastRunAt: subDays(now, 15).toISOString(),
      status: "COMPLETED",
      createdAt: subDays(now, 60).toISOString(),
    },
    {
      id: "sandbox-sched-4",
      protocolId: "sandbox-protocol",
      wallet: fakeWallet(),
      subject: "Security Audit Alert",
      body: "A security audit is scheduled for your protocol.",
      category: "defi",
      scheduleType: "ONE_TIME",
      timezone: "UTC",
      nextRunAt: subDays(now, 3).toISOString(),   // 3 days ago
      status: "FAILED",
      createdAt: subDays(now, 10).toISOString(),
    },
  ];

  const pageSize = 20;
  const total = pool.length;
  const items = pool.slice((page - 1) * pageSize, page * pageSize);

  return { items, total };
}

// ── Notification log ──────────────────────────────────────────────────────────

/** Base58 alphabet — mirrors Solana / wallet address charset */
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function fakeWallet(): string {
  return Array.from({ length: 44 }, () => B58[ri(0, B58.length - 1)]).join("");
}

function fakeId(): string {
  const hex = "0123456789abcdef";
  const seg = (n: number) => Array.from({ length: n }, () => hex[ri(0, 15)]).join("");
  return `${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}

const NOTIFICATION_POOL_SIZE = 60;

/** Lazily built per-render pool of fake notifications (stable within one render) */
function buildNotificationPool(): NotificationDto[] {
  const categories: NotificationDto["category"][] = [
    "defi", "governance", "marketing", "system",
  ];
  const statuses: NotificationDto["status"][] = [
    "delivered", "delivered", "delivered", "delivered", "delivered",
    "failed", "queued", "processing",
  ];

  return Array.from({ length: NOTIFICATION_POOL_SIZE }, () => {
    const status = pick(statuses);
    const minutesAgo = ri(1, 60 * 24 * 7); // up to 7 days ago
    const queuedAt = subMinutes(new Date(), minutesAgo).toISOString();
    const deliveredAt =
      status === "delivered"
        ? subMinutes(new Date(), minutesAgo - ri(1, 15)).toISOString()
        : null;
    const receiptTx =
      status === "delivered" && Math.random() > 0.3
        ? `${Array.from({ length: 64 }, () => "0123456789abcdef"[ri(0, 15)]).join("")}`
        : undefined;

    return {
      id: fakeId(),
      protocolId: "sandbox-protocol",
      walletHash: fakeWallet(),
      category: pick(categories),
      status,
      subjectHash: Array.from({ length: 16 }, () => "0123456789abcdef"[ri(0, 15)]).join(""),
      queuedAt,
      deliveredAt,
      receiptTx,
    };
  });
}

export function sandboxNotifications(
  page = 1,
  limit = 10,
  statusFilter?: string,
  categoryFilter?: string,
  search?: string,
): PaginatedNotifications {
  const pool = buildNotificationPool();

  // Apply filters
  const filtered = pool.filter((n) => {
    if (statusFilter && n.status !== statusFilter) return false;
    if (categoryFilter && n.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.walletHash.toLowerCase().includes(q) && !n.id.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  // Sort newest first
  filtered.sort((a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime());

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);

  return { items, total, page, limit };
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

const CAMPAIGN_SUBJECTS = [
  "Liquidation Risk Alert — Positions Below 1.2x",
  "Governance Vote: Q3 Protocol Parameters",
  "New Yield Opportunity: 28% APY on USDC Vaults",
  "Security Notice: Upgrade Your Wallet Client",
  "Monthly Protocol Performance Update",
  "Flash Sale: Double Rewards This Weekend",
];

const AUDIENCE_NAMES = [
  "DeFi Power Users",
  "Governance Participants",
  "High-Value Wallets",
  "Newsletter Subscribers",
  "Early Adopters",
];

export function sandboxCampaigns(): Campaign[] {
  const now = new Date();
  const statuses: Campaign["status"][] = [
    "COMPLETED", "COMPLETED", "RUNNING", "DRAFT", "SCHEDULED", "FAILED",
  ];

  return statuses.slice(0, ri(3, 6)).map((status, i) => {
    const createdAt = subDays(now, ri(1, 30)).toISOString();
    const walletCount = ri(800, 15_000);
    const totalTargets = walletCount;
    const totalSent =
      status === "COMPLETED" ? Math.floor(totalTargets * rf(0.92, 0.99, 3))
      : status === "RUNNING"  ? Math.floor(totalTargets * rf(0.30, 0.70, 3))
      : 0;
    const totalFailed =
      status === "FAILED" ? Math.floor(totalTargets * rf(0.1, 0.4, 3))
      : status === "COMPLETED" ? Math.floor(totalSent * rf(0.005, 0.03, 3))
      : 0;

    return {
      id: `sandbox-cmp-${i}`,
      protocolId: "sandbox-protocol",
      audienceId: `sandbox-aud-${i % 3}`,
      subject: CAMPAIGN_SUBJECTS[i % CAMPAIGN_SUBJECTS.length],
      body: "Herald sandbox demo campaign.",
      category: pick(["defi", "governance", "marketing", "security"]),
      channels: pick([["email"], ["email", "telegram"], ["telegram"]]),
      status,
      scheduledFor: status === "SCHEDULED" ? subDays(now, -2).toISOString() : undefined,
      startedAt:
        status === "RUNNING" || status === "COMPLETED" || status === "FAILED"
          ? subHours(now, ri(1, 48)).toISOString()
          : undefined,
      completedAt:
        status === "COMPLETED"
          ? subHours(now, ri(0, 24)).toISOString()
          : undefined,
      totalTargets,
      totalSent,
      totalFailed,
      createdAt,
      audience: {
        name: AUDIENCE_NAMES[i % AUDIENCE_NAMES.length],
        walletCount,
      },
    };
  });
}

// ── Audiences ─────────────────────────────────────────────────────────────────

export function sandboxAudiences(): Audience[] {
  const segments = [
    { name: "DeFi Power Users",          description: "Wallets with active lending/borrowing positions" },
    { name: "Governance Participants",    description: "Wallets that have cast at least one on-chain vote" },
    { name: "High-Value Wallets",         description: "Top 20% by protocol TVL contribution" },
    { name: "Newsletter Subscribers",     description: "Opted-in via the web widget" },
    { name: "Early Adopters",             description: "Registered in the first 30 days after launch" },
  ];

  return segments.slice(0, ri(3, 5)).map((seg, i) => ({
    id: `sandbox-aud-${i}`,
    protocolId: "sandbox-protocol",
    name: seg.name,
    description: seg.description,
    walletCount: ri(400, 12_000),
    createdAt: subDays(new Date(), ri(5, 90)).toISOString(),
  }));
}

// ── Webhook reliability ───────────────────────────────────────────────────────

export function sandboxWebhookReliability(): WebhookReliabilityResponse {
  const statuses: Array<"healthy" | "degraded" | "failing"> = [
    "healthy", "healthy", "healthy", "degraded",
  ];
  const endpoints = [
    "https://api.myprotocol.xyz/webhooks/herald",
    "https://hooks.myprotocol.xyz/notify",
  ];

  const webhooks = endpoints.map((url, i) => {
    const successRate = rf(88, 99.9, 1);
    const status = pick(statuses);
    return {
      id:                   `sandbox-wh-${i}`,
      url,
      isActive:             true,
      successRateLast7Days: successRate,
      p99LatencyMs:         ri(80, 450),
      totalDeliveries:      ri(200, 2_000),
      failedDeliveries:     Math.floor(ri(200, 2_000) * ((100 - successRate) / 100)),
      healthStatus:         status,
    };
  });

  return {
    webhooks,
    overallSuccessRate: rf(92, 99.5, 1),
  };
}
