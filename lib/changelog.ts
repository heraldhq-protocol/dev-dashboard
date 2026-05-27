export type ChangelogTag = "Feature" | "Improvement" | "Fix" | "Deprecation";

export interface ChangelogEntry {
  slug: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  tag: ChangelogTag;
  body: string; // plain text / simple markdown (rendered as-is)
  learnMoreUrl?: string;
}

// Entries are sorted newest-first at definition time.
// Add new entries at the TOP of the array.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    slug: "2026-05-27-sandbox-actions",
    date: "2026-05-27",
    title: "Sandbox mode now fully read-only — all mutable actions locked",
    tag: "Improvement",
    body: "Every destructive or mutable action across the dashboard (create, delete, revoke, verify, invite, cancel, save, etc.) is now disabled while in Sandbox mode. Attempting any write action shows a clear toast prompt to switch to Live mode. The Playground remains fully interactive in both environments.",
  },
  {
    slug: "2026-05-27-sandbox-data",
    date: "2026-05-27",
    title: "Rich sandbox preview data across all dashboard pages",
    tag: "Feature",
    body: "Sandbox mode now populates every page with realistic, randomly generated preview data — Notifications log (with status/category/search filtering), Audience analytics, Campaigns, Templates, and Scheduled Notifications. Explore the full dashboard experience without a live API key.",
  },
  {
    slug: "2026-05-27-scheduled-notifications",
    date: "2026-05-27",
    title: "Scheduled Notifications — new dashboard page",
    tag: "Feature",
    body: "A dedicated Scheduled Notifications page is now available under the Notifications section. View all pending, running, completed, failed, and cancelled scheduled sends with their next-run time, schedule type (one-time vs. recurring with cron expression), target wallet, and subject. Cancel pending/running jobs directly from the table.",
  },
  {
    slug: "2026-05-27-channel-coverage-fix",
    date: "2026-05-27",
    title: "Fix: channel coverage percentages now display correctly",
    tag: "Fix",
    body: "The Audience page channel breakdown was incorrectly displaying raw subscriber counts as percentages (e.g. \"Email 3347%\"). The donut chart tooltip and the breakdown list now correctly compute each channel's share of total coverage, always summing to 100%.",
  },
  {
    slug: "2026-05-16-sprint1",
    date: "2026-05-16",
    title: "Code Export, Projected Usage, Webhook Reliability & Changelog",
    tag: "Feature",
    body: "Four new features shipped across the dashboard: (1) Export your playground composition as ready-to-run TypeScript, JavaScript, cURL, or Python in one click. (2) Projected end-of-month usage card on the Overview page so you can anticipate overages before they hit. (3) Per-webhook reliability metrics (success rate, P99 latency, health status) surfaced directly in the Webhooks list. (4) This What's New panel — stay on top of Herald platform updates without leaving the dashboard.",
    learnMoreUrl: "https://useherald.xyz/docs",
  },
  {
    slug: "2026-05-01-sdk-v1-5",
    date: "2026-05-01",
    title: "SDK v1.5 — Multi-channel targeting & per-channel options",
    tag: "Feature",
    body: "herald.notify() now accepts a channels array so you can target email, Telegram, SMS, or any combination in a single call. Per-channel overrides (e.g. a different subject for SMS) are also supported via the channelOptions field.",
    learnMoreUrl: "https://useherald.xyz/docs/sdk",
  },
  {
    slug: "2026-04-15-audit-trail",
    date: "2026-04-15",
    title: "Audit interceptor — all mutating actions now logged",
    tag: "Improvement",
    body: "Every POST/PATCH/DELETE action performed by any team member is now captured in the AuditLog table. The Audit Log UI (Sprint 3) will surface this data. Enterprise customers can request a CSV export via hello@useherald.xyz in the meantime.",
  },
  {
    slug: "2026-04-01-antigravity-audit",
    date: "2026-04-01",
    title: "Security audit complete — all critical & high findings remediated",
    tag: "Improvement",
    body: "The Antigravity security audit (March 2026) identified 2 critical, 3 high, 4 medium, and 3 low severity findings. All critical and high severity issues have been fully remediated and re-verified. The audit report is available on request.",
    learnMoreUrl: "https://useherald.xyz/docs/security",
  },
  {
    slug: "2026-03-15-zk-receipts",
    date: "2026-03-15",
    title: "ZK-compressed delivery receipts now live on devnet",
    tag: "Feature",
    body: "Every notification delivery now writes an immutable proof to Light Protocol Merkle trees on Solana devnet (~$0.0001 per receipt, zero rent). View receipt transaction hashes in the Notifications log.",
  },
  {
    slug: "2026-03-01-telegram-channel",
    date: "2026-03-01",
    title: "Telegram channel — now in general availability",
    tag: "Feature",
    body: "Telegram delivery is now available on all paid tiers. Configure your Telegram Bot Token in Settings → Protocol Settings, and users can link their Telegram account via the Herald User Portal.",
  },
];

export function getUnreadCount(lastReadDate: string | null): number {
  if (!lastReadDate) return CHANGELOG_ENTRIES.length;
  return CHANGELOG_ENTRIES.filter((e) => e.date > lastReadDate).length;
}

export function getLatestDate(): string {
  return CHANGELOG_ENTRIES[0]?.date ?? new Date().toISOString().slice(0, 10);
}
