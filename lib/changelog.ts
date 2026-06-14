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
    slug: "2026-06-14-herald-cli",
    date: "2026-06-14",
    title: "Herald CLI — send notifications from the terminal",
    tag: "Feature",
    body: "The official Herald CLI (@herald-protocol/cli) is now available on npm. Install it globally with: npm install -g @herald-protocol/cli. Run herald auth login to authenticate, then herald doctor to verify your setup in one command. Supports every operation available in the dashboard — single sends, batch, broadcast, delivery status, templates, webhooks, campaigns, and scheduling. Built for CI/CD and AI agents: --json for machine-readable output, --wait to block until delivery, --from-stdin to pipe payloads from other tools, --idempotency-key for safe retries. Granular exit codes (auth, rate-limit, network) let scripts branch without parsing output.",
    learnMoreUrl: "https://docs.useherald.xyz/docs/cli",
  },
  {
    slug: "2026-05-27-sandbox-locked-actions",
    date: "2026-05-27",
    title: "Sandbox mode is now fully read-only",
    tag: "Improvement",
    body: "All mutable actions across the dashboard are now locked in Sandbox mode — this includes creating or revoking API keys, adding or removing webhook endpoints, toggling webhooks, inviting or removing team members, creating or deleting templates, cancelling scheduled notifications, updating project settings, saving retry policies, adding or removing custom assets, verifying domains, and registering SES/BIMI records. Attempting any of these actions in Sandbox mode shows a clear prompt to switch to Live mode. The Playground is intentionally excluded and remains fully interactive in both environments, so you can still compose and test notification calls without needing a live key.",
  },
  {
    slug: "2026-05-27-sandbox-preview-data",
    date: "2026-05-27",
    title: "Sandbox mode now shows realistic preview data on every page",
    tag: "Feature",
    body: "Every major dashboard page now serves rich, randomly generated preview data when you are in Sandbox mode — no live API key or real data required. Coverage includes: Notifications log (60 fake delivery records with DELIVERED, FAILED, PENDING, and BOUNCED statuses; filterable by status, category, and search), Audience analytics (subscriber counts, channel breakdown, growth chart), Campaigns (3–6 campaigns with proportional sent/delivered/failed counts), Templates (2–4 templates across APPROVED, PENDING_REVIEW, and DRAFT states), and Scheduled Notifications (one-time and recurring entries with PENDING, RUNNING, COMPLETED, and FAILED statuses). This allows new team members and design partners to explore the full dashboard experience before going live.",
  },
  {
    slug: "2026-05-27-scheduled-notifications-page",
    date: "2026-05-27",
    title: "Scheduled Notifications page",
    tag: "Feature",
    body: "A dedicated Scheduled Notifications page is now available under Notifications in the sidebar. The table displays every scheduled send associated with your project — including the next run time (shown as a relative countdown, e.g. \"3h from now\"), schedule type (one-time or recurring), cron expression for recurring jobs, target wallet address, notification subject, category, and current status (Pending, Running, Completed, Failed, Cancelled). Running jobs show a live pulsing indicator. Pending and Running jobs can be cancelled directly from the table. The page polls every 30 seconds in Live mode and supports pagination for large schedules. Requires a Growth plan or above.",
  },
  {
    slug: "2026-05-27-channel-coverage-fix",
    date: "2026-05-27",
    title: "Fix: Audience channel coverage percentages",
    tag: "Fix",
    body: "The channel breakdown on the Audience page was displaying raw subscriber counts in place of percentages — for example, \"Email 3347%\" instead of the correct share of total coverage. Both the donut chart tooltip and the breakdown list below it now correctly calculate each channel's percentage of total covered subscribers, always summing to 100%.",
  },
  {
    slug: "2026-05-16-code-export-usage-webhooks-changelog",
    date: "2026-05-16",
    title: "Code Export, Projected Usage, Webhook Reliability & What's New",
    tag: "Feature",
    body: "Four features shipped in this update: (1) Code Export — from the Playground, export your composed notification call as production-ready TypeScript, JavaScript, cURL, or Python with one click. The snippet includes your selected channel, template, recipient, and all options, ready to drop into your codebase. (2) Projected Usage — the Overview page now shows an end-of-month usage projection based on your current send rate, so you can spot potential overage before the billing cycle closes. (3) Webhook Reliability — each endpoint in the Webhooks list now surfaces its success rate, P99 delivery latency, and a colour-coded health status (Healthy / Degraded / Critical) computed from the last 30 days of delivery attempts. (4) This What's New panel — Herald platform updates are now surfaced directly in the dashboard. Unread entries are highlighted and a badge appears on the bell icon in the top navigation.",
    learnMoreUrl: "https://useherald.xyz/docs",
  },
  {
    slug: "2026-05-01-sdk-v1-5",
    date: "2026-05-01",
    title: "SDK v1.5 — Multi-channel targeting & per-channel options",
    tag: "Feature",
    body: "herald.notify() now accepts a channels array so you can target Email, Telegram, SMS, or any combination in a single API call. If you need channel-specific overrides — a shorter subject line for SMS, a different template for Telegram — pass them in the channelOptions field. Herald will fan out the delivery and apply the correct options per channel automatically. Update to @herald-protocol/sdk@1.5.0 or later to use these fields.",
    learnMoreUrl: "https://useherald.xyz/docs/sdk",
  },
  {
    slug: "2026-04-15-audit-trail",
    date: "2026-04-15",
    title: "All mutating dashboard actions are now audit-logged",
    tag: "Improvement",
    body: "Every POST, PATCH, and DELETE action performed by any team member through the dashboard or API — key creation/revocation, webhook changes, template edits, settings updates, and more — is now captured in the AuditLog table with a timestamp, actor identity, IP address, and a diff of the changed fields. An Audit Log viewer UI is planned for an upcoming release. Enterprise customers can request a full CSV export of their audit history at any time by emailing hello@useherald.xyz.",
  },
  {
    slug: "2026-04-01-antigravity-audit",
    date: "2026-04-01",
    title: "Security audit complete — all critical & high findings remediated",
    tag: "Improvement",
    body: "Herald completed an independent security audit with Antigravity in March 2026. The audit surfaced 2 critical, 3 high, 4 medium, and 3 low severity findings across the API, dashboard, and smart contract layers. All critical and high severity issues have been fully remediated and re-verified by the auditor. Medium and low findings are addressed in the current roadmap. The full audit report is available on request — reach out at hello@useherald.xyz.",
    learnMoreUrl: "https://useherald.xyz/docs/security",
  },
  {
    slug: "2026-03-15-zk-receipts",
    date: "2026-03-15",
    title: "ZK-compressed delivery receipts on Solana devnet",
    tag: "Feature",
    body: "Every notification delivery now writes an immutable, verifiable proof to Light Protocol Merkle trees on Solana devnet. Each receipt costs approximately $0.0001 and requires no rent — the proof is compressed and stored on-chain permanently. Receipt transaction hashes are visible in the Notifications log next to each delivery record. This gives your users a trustless, auditable record of every notification they received, independently verifiable without relying on Herald's infrastructure.",
  },
  {
    slug: "2026-03-01-telegram-channel",
    date: "2026-03-01",
    title: "Telegram channel — now generally available",
    tag: "Feature",
    body: "Telegram delivery is now out of beta and available on all paid tiers. To enable it: add your Telegram Bot Token in Settings → Protocol Settings, then direct your users to link their Telegram account via the Herald User Portal. Once linked, any notify() call that includes \"telegram\" in its channels array will deliver directly to the user's Telegram DMs. Telegram messages support plain text and basic Markdown formatting.",
  },
];

export function getUnreadCount(lastReadDate: string | null): number {
  if (!lastReadDate) return CHANGELOG_ENTRIES.length;
  return CHANGELOG_ENTRIES.filter((e) => e.date > lastReadDate).length;
}

export function getLatestDate(): string {
  return CHANGELOG_ENTRIES[0]?.date ?? new Date().toISOString().slice(0, 10);
}
