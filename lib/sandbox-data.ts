/**
 * Sandbox data generators — called fresh on every render so numbers change
 * each time the user switches to Sandbox mode.  All values are realistic
 * ranges chosen to look like a growing protocol in early traction.
 */

import { subDays, format } from "date-fns";
import type {
  DashboardStats,
  AnalyticsTrends,
  AudienceAnalytics,
  EngagementMetrics,
} from "@/lib/api/analytics";
import type { WebhookReliabilityResponse } from "@/lib/api/webhooks";

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

  return { statusBreakdown, categoryBreakdown, timeframeDays: days, totalVolume, dailyVolume };
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
