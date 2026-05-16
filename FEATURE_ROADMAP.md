# Herald Dev Dashboard — Feature Implementation Roadmap

> **Scope:** This document covers 15 features across the Herald platform.
> Each feature maps changes across three repos:
>
> - `herald-dev-dashboard` — Next.js 16 frontend (port: varies)
> - `herald-admin-registration-api` — NestJS 11 admin backend (port: 3001)
> - `herald-notification-gateway` — NestJS 11 notification backend + BullMQ workers (port: 3000)
>
> **Last updated:** May 2026

---

## Table of Contents

1. [Request Inspector / API Activity Log](#1-request-inspector--api-activity-log)
2. [Code Export from Playground](#2-code-export-from-playground)
3. [Delivery Retry Policy Configuration](#3-delivery-retry-policy-configuration)
4. [Environment Promotion Workflow](#4-environment-promotion-workflow)
5. [Embedded SDK Documentation Panel](#5-embedded-sdk-documentation-panel)
6. [API Key Scoping UI](#6-api-key-scoping-ui)
7. [Audience Segmentation / Cohort Targeting](#7-audience-segmentation--cohort-targeting)
8. [Scheduled & Recurring Notifications](#8-scheduled--recurring-notifications)
9. [Engagement Analytics (Opens, Clicks, Unsubscribes)](#9-engagement-analytics-opens-clicks-unsubscribes)
10. [Template Marketplace / Starter Library](#10-template-marketplace--starter-library)
11. [User Registration & Reach Analytics](#11-user-registration--reach-analytics)
12. [Quota & Cost Alerts](#12-quota--cost-alerts)
13. [Webhook Reliability Dashboard](#13-webhook-reliability-dashboard)
14. [Full Audit Log UI](#14-full-audit-log-ui)
15. [In-Dashboard Changelog & Product Updates](#15-in-dashboard-changelog--product-updates)

---

## Priority Matrix

| #   | Feature                        | Effort | Impact | Sprint |
| --- | ------------------------------ | ------ | ------ | ------ |
| 2   | Code Export from Playground    | Low    | High   | 1      |
| 12  | Quota & Cost Alerts            | Low    | High   | 1      |
| 13  | Webhook Reliability Dashboard  | Low    | Medium | 1      |
| 15  | In-Dashboard Changelog         | Low    | Medium | 1      |
| 1   | Request Inspector              | Medium | High   | 2      |
| 6   | API Key Scoping UI             | Low    | Medium | 2      |
| 4   | Environment Promotion Workflow | Medium | Medium | 2      |
| 5   | Embedded SDK Docs Panel        | Medium | Medium | 2      |
| 10  | Template Marketplace           | Medium | High   | 3      |
| 11  | User Registration Analytics    | Medium | High   | 3      |
| 9   | Engagement Analytics           | Medium | High   | 3      |
| 14  | Full Audit Log UI              | Medium | Medium | 3      |
| 3   | Delivery Retry Policy Config   | Medium | Medium | 3      |
| 7   | Audience Segmentation          | High   | High   | 4      |
| 8   | Scheduled Notifications        | High   | High   | 4      |

---

## Repo Path Reference

```
herald-dev-dashboard/
├── app/
│   └── (dashboard)/          ← all protected dashboard pages
├── components/
│   ├── ui/                   ← shadcn primitives
│   ├── shared/               ← DataTable, StatCard, PageHeader, etc.
│   ├── analytics/
│   ├── api-keys/
│   ├── billing/
│   ├── notifications/
│   ├── playground/
│   ├── templates/
│   ├── webhooks/
│   └── layout/
├── lib/
│   ├── api/                  ← typed API modules (axios)
│   └── stores/               ← Zustand stores

herald-admin-registration-api/
├── src/
│   ├── common/
│   │   └── interceptors/     ← audit.interceptor.ts, logging.interceptor.ts
│   ├── modules/
│   │   ├── api-key/
│   │   ├── analytics/
│   │   ├── billing/
│   │   ├── notification/
│   │   ├── protocol/
│   │   ├── team/
│   │   ├── template/
│   │   └── webhook/
│   └── prisma/schema.prisma

herald-notification-gateway/
├── src/
│   ├── modules/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── notify/
│   │   ├── queue/
│   │   │   └── workers/      ← mail.worker.ts, digest.worker.ts
│   │   ├── receipt/
│   │   ├── routing/
│   │   ├── template/
│   │   └── webhook/
│   └── prisma/schema.prisma  ← shared DB with admin-api
```

---

## Sprint 1 — Ship Fast, High Visible Value

---

## 1. Request Inspector / API Activity Log

### Why

When a developer's `herald.notify()` call fails silently or behaves unexpectedly,
there is no place in the dashboard to see what Herald actually received. They
must add custom logging to their own backend and correlate timestamps manually.
This single friction point kills integrations mid-flight. Stripe's API request log
is the gold standard — developers can see the exact payload sent, the response
body, HTTP status, and latency per call. The notification log at `/notifications`
shows _outcomes_; the request inspector shows the _exchange_ — these are different
debugging surfaces.

### Affected Repos

| Repo                            | Change Type                                   |
| ------------------------------- | --------------------------------------------- |
| `herald-notification-gateway`   | New middleware + new DB model + new endpoint  |
| `herald-admin-registration-api` | New endpoint to proxy/serve logs to dashboard |
| `herald-dev-dashboard`          | New page + components + API module            |

### Backend — `herald-notification-gateway`

**1. Prisma schema** (`prisma/schema.prisma`)

Add a new model to track every inbound API request:

```prisma
model ApiRequestLog {
  id            String   @id @default(cuid())
  protocolId    String
  apiKeyId      String?
  isTestKey     Boolean  @default(false)
  method        String
  endpoint      String
  requestBody   Json?
  responseBody  Json?
  statusCode    Int
  latencyMs     Int
  correlationId String?
  ipHash        String?
  createdAt     DateTime @default(now())

  protocol Protocol @relation(fields: [protocolId], references: [id])

  @@index([protocolId, createdAt(sort: Desc)])
  @@index([correlationId])
}
```

Run: `pnpm prisma migrate dev --name add_api_request_log`

**2. New interceptor** — `src/common/interceptors/request-log.interceptor.ts`

```
src/common/interceptors/
└── request-log.interceptor.ts   ← NEW
```

- Fires on every request that passes `AuthGuard` (i.e., authenticated API calls)
- Captures: method, URL, request body (sanitized — strip wallet keys, email blobs),
  response body (sanitized), status code, latency, correlationId from context
- Writes to `ApiRequestLog` table asynchronously (non-blocking, fire-and-forget)
- Retention: auto-purge rows older than 30 days via a scheduled `@Cron` job

Apply globally in `src/app.module.ts` after `AuthGuard`.

**3. New analytics endpoint** — `src/modules/analytics/analytics.controller.ts`

```
GET /analytics/requests
  Query: page, limit, apiKeyId, statusCode, endpoint, startDate, endDate
  Auth: WalletJwt + session guard
  Returns: paginated ApiRequestLog[]
```

Add to existing `AnalyticsModule`.

**4. Replay endpoint** — `src/modules/notify/notify.controller.ts`

```
POST /notify/replay/:requestLogId
  Auth: WalletJwt
  Body: (none — loads stored requestBody from ApiRequestLog)
  Returns: same shape as POST /notify
```

### Backend — `herald-admin-registration-api`

**Proxy endpoint** — `src/modules/analytics/analytics.controller.ts`

```
GET /analytics/requests
  Proxies to notification-gateway GET /analytics/requests
  Uses INTERNAL_API_KEY for service-to-service auth
```

This keeps the dashboard's single API base URL (`admin-api`) clean.

### Frontend — `herald-dev-dashboard`

**New files:**

```
app/(dashboard)/developer/
└── requests/
    ├── page.tsx                          ← metadata + layout
    └── page.client.tsx                   ← client component

components/requests/
├── RequestsTable.tsx                     ← paginated table (DataTable wrapper)
├── RequestDetailDrawer.tsx               ← slide-over with full JSON view
├── RequestFilters.tsx                    ← filter bar (key, status, endpoint, dates)
└── ReplayButton.tsx                      ← triggers replay mutation

lib/api/
└── requests.ts                           ← getRequestLogs(), replayRequest()
```

**Sidebar** — `components/layout/Sidebar.tsx`

Add "Request Inspector" link under the Developer section:

```tsx
{ label: "Request Inspector", href: "/developer/requests", icon: ActivityIcon }
```

**RequestsTable columns:**

- Timestamp (relative + absolute on hover)
- Method badge (`POST`, `GET`)
- Endpoint (`/v1/notify`, `/v1/notify/sandbox`, etc.)
- API Key (last 6 chars, masked)
- Status code (color-coded: green 2xx, amber 4xx, red 5xx)
- Latency (ms)
- Expand arrow → opens `RequestDetailDrawer`

**RequestDetailDrawer:**

- Split panes: Request body (Monaco read-only) | Response body (Monaco read-only)
- "Replay Request" button → calls `replayRequest(id)` mutation → populates playground

**React Query hook:**

```ts
// hooks/use-request-logs.ts
export function useRequestLogs(filters) {
  return useQuery({
    queryKey: ["requestLogs", filters],
    queryFn: () => getRequestLogs(filters),
  });
}
```

---

## 2. Code Export from Playground

### Why

The playground lets developers compose and preview multi-channel notifications,
but there is a dead-end: after building the payload, they must manually translate
it into SDK or REST code. This translation step is error-prone and adds 15–30
minutes to every integration session. The playground already holds all the state
needed to generate the code — it just needs to emit it.

### Affected Repos

| Repo                   | Change Type                                     |
| ---------------------- | ----------------------------------------------- |
| `herald-dev-dashboard` | New component in playground, no backend changes |

### Frontend — `herald-dev-dashboard`

**New files:**

```
components/playground/
└── CodeExportPanel.tsx    ← NEW — language tabs + generated snippet + copy
```

**Modified files:**

```
components/playground/composer-preview.tsx   ← add "Export Code" tab/button
lib/stores/use-composer-store.ts             ← read existing state (no changes needed)
```

**CodeExportPanel implementation:**

Reads from `use-composer-store`: `subject`, `body`, `category`, `channels`
(email/SMS/Telegram toggles), `testData` variables, selected channel.

Generates snippets for four languages via pure string interpolation (no external dep):

```
TypeScript (Herald SDK)
JavaScript (Herald SDK)
cURL
Python (httpx)
```

Example TypeScript output:

```typescript
import { Herald } from "@herald-protocol/sdk";

const herald = new Herald({ apiKey: process.env.HERALD_API_KEY });

await herald.notify({
  wallet: "WALLET_ADDRESS",
  subject: "{{subject}}",
  body: `{{body}}`,
  category: "{{category}}",
  channels: {{channels}},
});
```

**UI placement:**

Add a "< > Code" tab alongside the existing "Preview" tab in the playground
right-side panel (`composer-preview.tsx`). Uses the existing `Tabs` + `TabsList`
component from `components/ui/tabs.tsx`.

Language switcher: `TabsList` with tabs: `TypeScript | JavaScript | cURL | Python`.

Each tab: `SyntaxBlock` (already exists in `components/shared/SyntaxBlock.tsx`)
with `CopyButton` overlay.

The `use-playground-key` hook already provides the sandbox API key — reference
it in the generated snippet so the copy-pasteable code is immediately runnable.

**No backend changes required.**

---

## 3. Delivery Retry Policy Configuration

### Why

Retry behavior is currently invisible to protocol operators — it is a backend
default with no UI. In DeFi, the cost of a missed notification is asymmetric:
a liquidation warning that was not retried after a transient email bounce means
a user lost funds. Operators need visibility and control. The webhook system
already has delivery attempt logs, establishing the precedent. Retry policy
belongs in the same family of settings.

### Affected Repos

| Repo                            | Change Type                                   |
| ------------------------------- | --------------------------------------------- |
| `herald-notification-gateway`   | Prisma schema + worker logic reads new config |
| `herald-admin-registration-api` | New settings endpoint                         |
| `herald-dev-dashboard`          | New settings section + API module             |

### Backend — `herald-notification-gateway`

**1. Prisma schema** (`prisma/schema.prisma`)

Extend `ProtocolSettings` model:

```prisma
model ProtocolSettings {
  // ... existing fields ...

  // Retry policy — NEW
  retryMaxAttempts    Int     @default(3)          // 1–5
  retryWindowHours    Int     @default(6)          // 1 | 6 | 24
  retryBackoff        String  @default("exponential") // "linear" | "exponential"
  criticalCategories  String[] @default([])        // e.g. ["defi", "security"]
}
```

Run: `pnpm prisma migrate dev --name add_retry_policy`

**2. Mail worker** — `src/modules/queue/workers/mail.worker.ts`

Read `ProtocolSettings.retryMaxAttempts`, `retryWindowHours`, and `retryBackoff`
when enqueuing a job. Pass as BullMQ job options:

```ts
const settings = await this.protocolService.getSettings(protocolId);
await this.queue.add("notify", payload, {
  attempts: settings.retryMaxAttempts,
  backoff: {
    type: settings.retryBackoff, // "exponential" | "linear"
    delay:
      (settings.retryWindowHours * 60 * 60 * 1000) / settings.retryMaxAttempts,
  },
});
```

For `criticalCategories`: if the notification's `category` is in the list,
override with max retries (5) regardless of settings.

**3. Notification log update** — record `attemptNumber` on each delivery.

Extend `Notification` model:

```prisma
model Notification {
  // ... existing fields ...
  attemptNumber  Int  @default(1)
  nextRetryAt    DateTime?
}
```

### Backend — `herald-admin-registration-api`

**New endpoints** — `src/modules/protocol/protocol.controller.ts`

```
GET  /protocol/settings/retry
PATCH /protocol/settings/retry
  Body: { retryMaxAttempts, retryWindowHours, retryBackoff, criticalCategories }
  Auth: Owner | Admin role only (RbacGuard)
```

Add service method to `ProtocolService` for reading/writing retry policy fields.

### Frontend — `herald-dev-dashboard`

**Modified files:**

```
app/(dashboard)/settings/
└── page.client.tsx    ← add "Delivery Retry" section

lib/api/protocol.ts   ← add getRetryPolicy(), updateRetryPolicy()

components/settings/
└── RetryPolicyForm.tsx   ← NEW
```

**RetryPolicyForm UI:**

- Max retries: `Select` (1 / 2 / 3 / 4 / 5), default 3
- Retry window: `Select` (1 hour / 6 hours / 24 hours), default 6 hours
- Backoff strategy: `RadioGroup` (Linear / Exponential)
- Critical categories: `CheckboxGroup` (DeFi, Governance, Security, System,
  Marketing) — notifications in these categories always use max retries
- Save button (Owner/Admin only — disable for Developer/Read-only roles)

**Retry count in notification log** — `components/notifications/NotificationsTable.tsx`

Add "Attempts" column: shows `attemptNumber` / `retryMaxAttempts` with a
badge colored by ratio (green = 1/3, amber = 2/3, red = 3/3).

---

## 4. Environment Promotion Workflow

### Why

Developers build and test templates, webhooks, and settings in sandbox, then
must manually recreate everything in the live environment. This re-entry is
error-prone and slows go-live. The sandbox/live environment split already exists
in the dashboard (the `EnvironmentBadge` component, the TopNav switcher). The
promotion workflow is the missing bridge between them.

### Affected Repos

| Repo                            | Change Type                                          |
| ------------------------------- | ---------------------------------------------------- |
| `herald-admin-registration-api` | New promote endpoints for templates and webhooks     |
| `herald-dev-dashboard`          | Promote button on template/webhook rows + diff modal |

### Backend — `herald-admin-registration-api`

**Template promotion** — `src/modules/template/template.controller.ts`

```
POST /templates/:id/promote
  Auth: Owner | Admin
  Body: (none)
  Logic: duplicate the template record with isTestKey = false
  Returns: new live template id
```

**Webhook promotion** — `src/modules/webhook/webhook.controller.ts`

```
POST /webhooks/:id/promote
  Auth: Owner | Admin
  Body: (none)
  Logic: create a new webhook record with the same url, events, isTestKey = false
  Returns: new live webhook id
```

**Settings sync** — `src/modules/protocol/protocol.controller.ts`

```
POST /protocol/settings/sync-to-sandbox
  Auth: Owner | Admin
  Logic: copies non-sensitive ProtocolSettings fields from live to sandbox variant
```

### Frontend — `herald-dev-dashboard`

**Modified files:**

```
components/templates/TemplateList.tsx (or wherever template rows render)
  ← add "Promote to Live" action in row dropdown (sandbox env only)

components/webhooks/WebhookList.tsx
  ← add "Promote to Live" action in row dropdown (sandbox env only)

components/shared/PromoteDiffModal.tsx   ← NEW
  ← shows what will change before confirming

lib/api/templates.ts   ← add promoteTemplate(id)
lib/api/webhooks.ts    ← add promoteWebhook(id)
```

**PromoteDiffModal:**

- Title: "Promote to Live Environment"
- Body: two-column diff (Sandbox → Live) showing the fields that will be created
- Warning banner: "This will create a new live webhook/template. Existing live
  records are not overwritten."
- Confirm button (Owner/Admin only)
- On success: invalidate live environment query cache, toast "Promoted to live"

**Visibility rule:** "Promote to Live" action only appears when:

- Current environment is `sandbox` (read from `ui.store.ts` environment state)
- User role is `Owner` or `Admin`

---

## Sprint 2 — Deepen Developer Experience

---

## 5. Embedded SDK Documentation Panel

### Why

Developers leave the dashboard every time they need to check a parameter name,
endpoint path, or error code because docs live at `docs.useherald.xyz`. This
context switching compounds across dozens of references per integration session.
An in-dashboard reference panel removes the tab-switching without requiring full
documentation to be rebuilt inside the app.

### Affected Repos

| Repo                   | Change Type                              |
| ---------------------- | ---------------------------------------- |
| `herald-dev-dashboard` | New drawer component + keyboard shortcut |

### Frontend — `herald-dev-dashboard`

**New files:**

```
components/docs/
├── DocsDrawer.tsx          ← slide-over drawer container
├── DocsSearch.tsx          ← fuzzy search over section headings
└── docs-content/
    ├── quick-start.mdx     ← inline MDX content
    ├── notify-api.mdx
    ├── channels.mdx
    ├── webhook-events.mdx
    └── error-codes.mdx

hooks/
└── use-docs-drawer.ts      ← Zustand slice or simple useState in context
```

**Modified files:**

```
components/layout/TopNav.tsx
  ← add ? icon button that opens DocsDrawer

components/layout/DashboardShell.tsx
  ← register keyboard shortcut: Ctrl+/ (or Ctrl+?) → toggle DocsDrawer

lib/stores/ui.store.ts
  ← add isDocsOpen: boolean, toggleDocs() action
```

**DocsDrawer:**

- Width: 480px, slides in from the right
- Header: Herald logo + "Quick Reference" + close button
- Search input at top (fuzzy filter over section headings using simple string match)
- Sections rendered from MDX via `next-mdx-remote` or static string templates
  (static strings preferred — no extra dep, simpler):
  - Quick Start
  - `herald.notify()` reference (all params, types, required/optional)
  - Channel options
  - Webhook event types
  - Error codes and meanings
- Each code snippet: `SyntaxBlock` + `CopyButton` (both already exist)
- "Try in Playground" button on `herald.notify()` examples → navigates to
  `/playground` and populates composer with the example payload
- "Full docs ↗" link at the bottom opens `docs.useherald.xyz` in a new tab

**No backend changes required.**

---

## 6. API Key Scoping UI

### Why

All API keys today are full-access. Enterprise customers with separate services
(notification sender, analytics reader, CI/CD template manager) require
least-privilege keys. A single compromised full-access key exposes every
operation. Security reviews at enterprise protocols will block integration until
scoped keys are available. The `speakeasy` and `bcrypt` deps already exist,
confirming security-first infrastructure is in place.

### Affected Repos

| Repo                            | Change Type                                        |
| ------------------------------- | -------------------------------------------------- |
| `herald-notification-gateway`   | `ScopeGuard` already exists — extend scope list    |
| `herald-admin-registration-api` | Extend `CreateApiKeyDto`, store scopes on `ApiKey` |
| `herald-dev-dashboard`          | Extend `CreateKeyModal` with scope checkboxes      |

### Backend — `herald-admin-registration-api`

**1. Prisma schema** (`prisma/schema.prisma`)

The `ApiKey` model likely already has a `scopes` field (the gateway's `scope.guard.ts`
implies scopes exist). Verify and extend if needed:

```prisma
model ApiKey {
  // ... existing fields ...
  scopes  String[]  @default(["notify:send", "notify:read", "analytics:read",
                               "templates:read", "templates:write",
                               "webhooks:read", "webhooks:write", "keys:manage"])
}
```

If `scopes` doesn't exist yet:

```
pnpm prisma migrate dev --name add_api_key_scopes
```

**2. DTO** — `src/modules/api-key/dto/create-api-key.dto.ts`

```ts
export const VALID_SCOPES = [
  "notify:send",
  "notify:read",
  "analytics:read",
  "templates:read",
  "templates:write",
  "webhooks:read",
  "webhooks:write",
  "keys:manage",
] as const;

export class CreateApiKeyDto {
  name: string;
  scopes: (typeof VALID_SCOPES)[number][];
  isTestKey: boolean;
}
```

**3. Service** — `src/modules/api-key/api-key.service.ts`

Validate that `keys:manage` scope can only be assigned by Owner role
(check in `ApiKeyController` using `@Roles` + `RbacGuard`).

### Backend — `herald-notification-gateway`

**`src/common/guards/scope.guard.ts`** (already exists)

Ensure all scope strings from the new list are handled. Add `@RequireScopes()`
decorator calls to relevant controllers:

```
NotifyController     → @RequireScopes("notify:send")
AnalyticsController  → @RequireScopes("analytics:read")
TemplateController   → @RequireScopes("templates:read") or "templates:write"
WebhookController    → @RequireScopes("webhooks:read") or "webhooks:write"
```

### Frontend — `herald-dev-dashboard`

**Modified files:**

```
components/api-keys/CreateKeyModal.tsx
  ← replace any scope placeholder with full scope checklist

components/api-keys/ApiKeyTable.tsx
  ← add Scopes column showing scope pill chips
```

**CreateKeyModal scope section:**

Group scopes by category with checkboxes:

```
Notifications
  ☑ notify:send    — Send notifications to registered wallets
  ☑ notify:read    — Read notification delivery logs

Analytics
  ☑ analytics:read — Read dashboard analytics data

Templates
  ☑ templates:read  — List and preview templates
  □ templates:write — Create and modify templates

Webhooks
  ☑ webhooks:read   — List webhook endpoints
  □ webhooks:write  — Create and manage webhooks

Admin
  □ keys:manage     — Create and revoke API keys (Owner only)
```

Default selection: `notify:send + notify:read + analytics:read + templates:read

- webhooks:read` (safe read-heavy defaults).

**ApiKeyTable scope chips:**

Show scope pills on each row: `notify:send`, `analytics:read`, etc.
Truncate if > 3 scopes and show "+N more" that expands on hover via `Tooltip`.

---

## Sprint 2 — Continued

---

## 7. Audience Segmentation / Cohort Targeting

### Why

Currently, protocols send one notification per `herald.notify(wallet)` call. To
reach their entire user base they must fetch their user list, filter it, and loop
through calling the API once per user. That means protocols build their own
targeting logic — exactly the undifferentiated work Herald should absorb.
Real use cases: "Notify only wallets with open positions," "Notify governance
token holders," "Notify unclaimed airdrop recipients." Without segmentation,
Herald is a per-wallet API, not a notification platform.

### Affected Repos

| Repo                            | Change Type                                         |
| ------------------------------- | --------------------------------------------------- |
| `herald-admin-registration-api` | New Campaign + Audience models + endpoints          |
| `herald-notification-gateway`   | New batch enqueue endpoint + BullMQ campaign worker |
| `herald-dev-dashboard`          | New `/campaigns` page + audience builder components |

### Backend — `herald-admin-registration-api`

**1. Prisma schema**

```prisma
model Audience {
  id          String   @id @default(cuid())
  protocolId  String
  name        String
  description String?
  wallets     String[] // wallet pubkeys (hashed for storage)
  walletCount Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  protocol  Protocol   @relation(fields: [protocolId], references: [id])
  campaigns Campaign[]

  @@index([protocolId])
}

model Campaign {
  id           String         @id @default(cuid())
  protocolId   String
  audienceId   String
  templateId   String?
  subject      String
  body         String
  category     String
  channels     String[]
  status       CampaignStatus @default(DRAFT)
  scheduledFor DateTime?
  startedAt    DateTime?
  completedAt  DateTime?
  totalTargets Int            @default(0)
  totalSent    Int            @default(0)
  totalFailed  Int            @default(0)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  protocol Protocol  @relation(fields: [protocolId], references: [id])
  audience Audience  @relation(fields: [audienceId], references: [id])

  @@index([protocolId, status])
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

Run: `pnpm prisma migrate dev --name add_campaigns`

**2. New module** — `src/modules/campaigns/`

```
src/modules/campaigns/
├── campaigns.module.ts
├── campaigns.controller.ts
├── campaigns.service.ts
├── audiences.controller.ts
├── audiences.service.ts
└── dto/
    ├── create-audience.dto.ts   (name, wallets: string[])
    ├── create-campaign.dto.ts   (audienceId, subject, body, category, channels, scheduledFor?)
    └── campaign-response.dto.ts
```

**Endpoints:**

```
POST   /audiences               — create audience (upload wallet list)
GET    /audiences               — list audiences for protocol
DELETE /audiences/:id           — delete audience

POST   /campaigns               — create campaign (draft)
GET    /campaigns               — list campaigns
GET    /campaigns/:id           — get campaign + progress
POST   /campaigns/:id/launch    — launch (enqueues batch job to gateway)
DELETE /campaigns/:id           — cancel (if DRAFT or SCHEDULED)
```

`POST /campaigns/:id/launch` calls gateway via internal service:

```
POST http://gateway/internal/campaigns/:id/enqueue
Authorization: Internal-Service-Secret
```

### Backend — `herald-notification-gateway`

**New endpoint** — `src/modules/admin/admin.controller.ts`

```
POST /internal/campaigns/:id/enqueue
  Guard: InternalServiceGuard
  Logic: fetch campaign + audience from DB, enqueue one BullMQ NOTIFICATION
         job per wallet in the audience with a 10ms delay spread to avoid
         rate-limit spikes (rate = tier.maxPerSecond)
```

**New BullMQ queue** — `CAMPAIGN` queue in `src/modules/queue/queue.constants.ts`

**New worker** — `src/modules/queue/workers/campaign.worker.ts`

```
Processor: CAMPAIGN queue
Logic:
  1. Fetch wallet batch (100 at a time from audience)
  2. For each wallet: resolve PDA → decrypt via enclave → dispatch via
     ChannelDispatchService (same as mail.worker.ts)
  3. Update Campaign.totalSent / totalFailed counters on each batch complete
  4. On all batches done: set Campaign.status = COMPLETED, Campaign.completedAt
```

### Frontend — `herald-dev-dashboard`

**New files:**

```
app/(dashboard)/campaigns/
├── page.tsx                     ← metadata
└── page.client.tsx              ← campaigns list

app/(dashboard)/campaigns/new/
└── page.client.tsx              ← multi-step campaign builder

components/campaigns/
├── CampaignList.tsx             ← table of campaigns + status badges
├── CampaignBuilder.tsx          ← multi-step form (Step1: Audience → Step2: Message → Step3: Schedule → Step4: Review)
├── AudienceUploader.tsx         ← CSV upload + wallet list preview
├── AudienceSelector.tsx         ← dropdown of saved audiences
├── CampaignProgressCard.tsx     ← live progress (sent/failed/total) via React Query polling
└── CampaignStatusBadge.tsx      ← status chip (DRAFT/RUNNING/COMPLETED/etc.)

lib/api/
├── audiences.ts                 ← createAudience(), listAudiences(), deleteAudience()
└── campaigns.ts                 ← createCampaign(), listCampaigns(), getCampaign(), launchCampaign()
```

**Sidebar** — add "Campaigns" link under Main section.

**AudienceUploader:** accepts CSV with one wallet pubkey per row, validates
each as a Solana pubkey (reuse `is-solana-public-key.decorator.ts` logic
client-side), shows count preview before saving.

**CampaignBuilder steps:**

1. **Audience** — choose saved audience or upload new
2. **Message** — subject, body (reuse `composer-editor.tsx`), category, channels
3. **Schedule** — send now or pick datetime (see Feature 8 for scheduler)
4. **Review** — estimated reach, cost preview (audience size × $0.005 if over quota)

---

## 8. Scheduled & Recurring Notifications

### Why

DeFi events are time-bound: governance votes close at specific blocks, reward
distributions happen on schedule, liquidation risks compound overnight. Today
protocols must run their own cron jobs to call the Herald API at the right time.
That is operational burden Herald should own. "Governance vote notifications"
and "staking rewards updates" — two of the listed primary use cases — are
inherently scheduled.

### Affected Repos

| Repo                            | Change Type                                                      |
| ------------------------------- | ---------------------------------------------------------------- |
| `herald-notification-gateway`   | New ScheduledJob model + BullMQ delayed jobs + schedule endpoint |
| `herald-admin-registration-api` | Proxy schedule endpoints                                         |
| `herald-dev-dashboard`          | Schedule picker in playground + campaigns builder                |

### Backend — `herald-notification-gateway`

**1. Prisma schema**

```prisma
model ScheduledNotification {
  id           String              @id @default(cuid())
  protocolId   String
  wallet       String?             // null = campaign (all audience)
  audienceId   String?
  subject      String
  body         String
  category     String
  channels     String[]
  scheduleType ScheduleType        @default(ONE_TIME)
  cronExpr     String?             // for RECURRING
  timezone     String              @default("UTC")
  nextRunAt    DateTime
  lastRunAt    DateTime?
  status       ScheduledJobStatus  @default(PENDING)
  createdAt    DateTime            @default(now())

  protocol Protocol @relation(fields: [protocolId], references: [id])

  @@index([protocolId, status, nextRunAt])
}

enum ScheduleType {
  ONE_TIME
  RECURRING
}

enum ScheduledJobStatus {
  PENDING
  RUNNING
  COMPLETED
  CANCELLED
  FAILED
}
```

Run: `pnpm prisma migrate dev --name add_scheduled_notifications`

**2. New endpoints** — `src/modules/notify/notify.controller.ts`

```
POST   /notify/schedule         — create one-time scheduled notification
POST   /notify/schedule/cron    — create recurring notification (cronExpr + timezone)
GET    /notify/schedule         — list scheduled notifications (paginated)
DELETE /notify/schedule/:id     — cancel scheduled notification
```

**3. BullMQ delayed jobs**

In `QueueService`, when a scheduled notification is created, enqueue a BullMQ
job with a `delay` equal to `nextRunAt - now()`:

```ts
await this.queue.add("notify", payload, {
  delay: nextRunAt.getTime() - Date.now(),
  jobId: `scheduled-${scheduledNotificationId}`, // dedupe
});
```

For `RECURRING`: after each execution, compute the next cron fire time using
`cronstrue` or `cron-parser`, re-enqueue with new delay, update `nextRunAt`.

**4. Scheduler service** — `src/modules/notify/scheduler.service.ts`

```
@Cron("*/5 * * * *")  // every 5 minutes
async reconcileScheduled(): Promise<void>
  // Safety net: find PENDING jobs whose nextRunAt is in the past and
  // were not enqueued (e.g. after server restart). Re-enqueue them.
```

### Backend — `herald-admin-registration-api`

Proxy `GET/POST/DELETE /notify/schedule` to the gateway using
`INTERNAL_API_KEY`. Add to `NotificationModule` or new `ScheduleModule`.

### Frontend — `herald-dev-dashboard`

**Modified files:**

```
components/playground/composer-preview.tsx (or composer-editor.tsx)
  ← add "Schedule" button alongside "Send Test"

components/campaigns/CampaignBuilder.tsx
  ← Step 3 already references schedule (see Feature 7)
```

**New files:**

```
components/shared/SchedulePicker.tsx    ← NEW: datetime + timezone + recurrence
app/(dashboard)/notifications/scheduled/
├── page.tsx
└── page.client.tsx                     ← list of scheduled notifications
```

**SchedulePicker component:**

- Toggle: "Send Now" / "Schedule for Later" / "Recurring"
- "Schedule for Later": `DatePicker` + `TimePicker` + `TimezoneSelect`
  (use `Intl.supportedValuesOf("timeZone")` — no extra dep)
- "Recurring": visual cron builder
  - Frequency select: Hourly / Daily / Weekly / Monthly / Custom
  - Day-of-week grid for Weekly
  - Preview: "Next 5 fires: Mon Jun 2 09:00 UTC, ..."
- Uses `cron-parser` (add to dependencies) for client-side preview calculation

**Scheduled notifications list** (`/notifications/scheduled`):

- Table: next run, schedule type (one-time / recurring), subject, status, actions
- Cancel button → `DELETE /notify/schedule/:id`

---

## Sprint 3 — Platform Expansion

---

## 9. Engagement Analytics (Opens, Clicks, Unsubscribes)

### Why

The current analytics page tracks delivery status (sent/failed/bounced) — that
is infrastructure telemetry. Protocol product managers need engagement telemetry:
"Did users read the notification? Did they click through? Which template variant
performs better?" Without this data, protocols cannot measure notification ROI
and will churn when they cannot justify the Herald subscription cost.

### Affected Repos

| Repo                            | Change Type                                                |
| ------------------------------- | ---------------------------------------------------------- |
| `herald-notification-gateway`   | Track pixel endpoint + click-wrap endpoint + new DB models |
| `herald-admin-registration-api` | Proxy engagement analytics endpoint                        |
| `herald-dev-dashboard`          | New analytics cards + per-template table                   |

### Backend — `herald-notification-gateway`

**1. Prisma schema**

```prisma
model NotificationEngagement {
  id             String   @id @default(cuid())
  notificationId String
  protocolId     String
  eventType      String   // "open" | "click" | "unsubscribe"
  linkUrl        String?  // for click events
  userAgentHash  String?
  createdAt      DateTime @default(now())

  notification Notification @relation(fields: [notificationId], references: [id])

  @@index([protocolId, eventType, createdAt])
  @@index([notificationId])
}
```

Run: `pnpm prisma migrate dev --name add_notification_engagement`

**2. Track pixel endpoint** — `src/modules/notify/notify.controller.ts`

```
GET /notify/track/open/:notificationId
  — Returns a 1×1 transparent GIF
  — Writes NotificationEngagement { eventType: "open" }
  — No auth required (public endpoint, accessed by email client)
  — Rate limited: 1 open event per notificationId (dedup in Redis with TTL 24h)
```

**Email template injection** — in `MailService` (`src/modules/mail/mail.service.ts`),
append a 1×1 `<img>` tag before `</body>`:

```html
<img
  src="https://api.useherald.xyz/notify/track/open/{{notificationId}}"
  width="1"
  height="1"
  alt=""
  style="display:none"
/>
```

Only injected when `trackEngagement` is enabled in `ProtocolSettings`.

**3. Click-wrap endpoint** — `src/modules/notify/notify.controller.ts`

```
GET /notify/track/click/:notificationId
  Query: url (base64-encoded destination)
  — Writes NotificationEngagement { eventType: "click", linkUrl: decoded url }
  — Redirects to decoded url (302)
  — No auth required
```

Link rewriting in `MailService`: before sending, replace all `http(s)://` URLs
in the email body (excluding track/unsubscribe URLs) with click-wrap URLs.
Use existing `src/common/utils/link-parser.ts` (already in the gateway) for
safe URL extraction.

**4. Engagement analytics aggregation** — `src/modules/analytics/analytics.service.ts`

Add query:

```ts
async getEngagementMetrics(protocolId: string, startDate: Date, endDate: Date) {
  // Group NotificationEngagement by eventType, count distinct notificationId
  // Return: openRate, clickRate, unsubscribeRate, per-template breakdown
}
```

**New endpoint:**

```
GET /analytics/engagement
  Query: startDate, endDate, templateId?
  Auth: WalletJwt
  Returns: { openRate, clickRate, unsubscribeRate, byTemplate: [...] }
```

### Backend — `herald-admin-registration-api`

Proxy `GET /analytics/engagement` to gateway. Add to `AnalyticsController`.

New `ProtocolSettings` field:

```prisma
trackEngagement  Boolean  @default(false)
```

Add `PATCH /protocol/settings` to toggle engagement tracking. Default off
(opt-in for privacy — some protocols may want to disable it).

### Frontend — `herald-dev-dashboard`

**Modified files:**

```
app/(dashboard)/analytics/page.client.tsx
  ← add Engagement section below existing delivery stats

components/analytics/
├── EngagementKpiRow.tsx        ← NEW: Open Rate, Click Rate, Unsubscribe Rate cards
├── EngagementTrendChart.tsx    ← NEW: time-series line chart (Recharts)
└── TemplatePerformanceTable.tsx ← NEW: per-template engagement table

lib/api/analytics.ts
  ← add getEngagementMetrics(startDate, endDate, templateId?)
```

**EngagementKpiRow:** three `StatCard` components (already exists):

- Open Rate: `opens / sends × 100%` with delta vs previous period
- Click Rate: `clicks / sends × 100%`
- Unsubscribe Rate: `unsubs / sends × 100%`

**TemplatePerformanceTable columns:**
Template name | Sends | Opens | Clicks | CTR | Unsub rate | Avg latency

**Settings toggle** — `app/(dashboard)/settings/page.client.tsx`:
Add "Engagement Tracking" toggle (Switch component) under Email Settings section.

---

## 10. Template Marketplace / Starter Library

### Why

Starting from a blank canvas in the template editor is high friction. Every
protocol building a "liquidation warning" email solves the same design and copy
problem independently. Herald has documented 11 integration examples across 9
frameworks — those use cases should map directly to ready-to-use templates.
A curated library also raises the floor on notification quality across the
platform, which improves deliverability reputation on Herald's shared sending
infrastructure.

### Affected Repos

| Repo                            | Change Type                              |
| ------------------------------- | ---------------------------------------- |
| `herald-admin-registration-api` | New MarketplaceTemplate model + endpoint |
| `herald-dev-dashboard`          | New template gallery page + import flow  |

### Backend — `herald-admin-registration-api`

**1. Prisma schema**

```prisma
model MarketplaceTemplate {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  description   String
  category      String   // "defi" | "governance" | "rewards" | "security" | "system" | "marketing"
  useCaseTag    String   // "liquidation-warning" | "governance-vote" | etc.
  emailHtml     String
  emailSubject  String
  smsText       String
  telegramText  String
  variables     Json     // { name: string, description: string, example: string }[]
  previewImageUrl String?
  isOfficial    Boolean  @default(true)
  usageCount    Int      @default(0)
  createdAt     DateTime @default(now())

  @@index([category])
}
```

Run: `pnpm prisma migrate dev --name add_marketplace_templates`

**2. Seed file** — `prisma/seeds/marketplace-templates.ts`

Create seed data for the 9 primary DeFi use cases from the product context:

- Liquidation Warning
- Governance Vote Open
- Governance Vote Closing (24h reminder)
- Batch Airdrop Claim Available
- Staking Rewards Distributed
- Yield APY Change Alert
- Bridge Transfer Completed
- Multi-Sig Transaction Pending
- Security Alert

Each with email HTML (Herald brand + Handlebars variables), SMS fallback,
Telegram markdown, and variable documentation.

**3. Endpoints** — new `src/modules/template/template.controller.ts` routes

```
GET  /templates/marketplace                   — list all marketplace templates
GET  /templates/marketplace/:slug             — get one template (with full HTML)
POST /templates/marketplace/:slug/import      — clone into protocol's own templates
  Body: { name? }  (optional custom name)
  Returns: new Template id
```

On import: increment `MarketplaceTemplate.usageCount`, create a new `Template`
record owned by the protocol (copy of all fields).

### Frontend — `herald-dev-dashboard`

**New files:**

```
app/(dashboard)/templates/marketplace/
├── page.tsx
└── page.client.tsx           ← template gallery

components/templates/
├── MarketplaceGallery.tsx    ← grid of MarketplaceTemplateCard
├── MarketplaceTemplateCard.tsx ← card with preview thumbnail, use-case tag, import button
├── TemplatePreviewModal.tsx  ← full preview (email rendered in iframe sandbox + SMS + Telegram tabs)
└── ImportButton.tsx          ← import mutation + success toast
```

**Modified files:**

```
app/(dashboard)/templates/page.client.tsx
  ← add "Browse Marketplace" button in PageHeader actions

lib/api/templates.ts
  ← add listMarketplaceTemplates(), importMarketplaceTemplate(slug)
```

**MarketplaceGallery:**

- Filter bar: category pills (All / DeFi / Governance / Rewards / Security / System)
- Grid: 3-column `MarketplaceTemplateCard` grid
- Each card: thumbnail, use-case name, description (1 line), category badge,
  variable count ("3 variables"), "Preview" button, "Import" button
- Import → `POST /templates/marketplace/:slug/import` → invalidate `/templates` query
  → toast "Template imported. [Open in editor →]"

**TemplatePreviewModal:**

- Tabs: Email | SMS | Telegram
- Email tab: `<iframe sandbox="allow-same-origin">` with rendered HTML
- Variable documentation table below preview

---

## 11. User Registration & Reach Analytics

### Why

Protocol operators have no visibility into their notification audience. They
integrate the SDK, users register at `notify.useherald.xyz`, and then there
is no feedback loop. "How many of our users have registered?" "Is our
registration CTA converting?" "What fraction can we actually reach via Telegram?"
are unanswered questions. Their absence makes it hard for protocols to justify
Herald to their own leadership, which drives churn.

### Affected Repos

| Repo                            | Change Type                                 |
| ------------------------------- | ------------------------------------------- |
| `herald-admin-registration-api` | New audience analytics endpoints            |
| `herald-dev-dashboard`          | New `/audience` page + analytics components |

### Backend — `herald-admin-registration-api`

**New endpoints** — `src/modules/analytics/analytics.controller.ts`

```
GET /analytics/audience
  Returns:
  {
    totalRegistered: number,
    activeLastThirtyDays: number,
    channelCoverage: { email: number, telegram: number, sms: number },
    registrationTrend: { date: string, count: number }[],   // daily, last 90 days
    retentionRate: number,   // % of 30-day-old registrations still active
  }
```

**Query logic** — `src/modules/analytics/analytics.service.ts`:

The `PortalUser` model stores `walletHash`, `optInAll`, channel preferences,
and `protocolId` associations. Aggregate over `PortalUser` + `PortalSession`
records to compute the above metrics. All wallet data is already hashed —
no PII exposed.

### Frontend — `herald-dev-dashboard`

**New files:**

```
app/(dashboard)/audience/
├── page.tsx
└── page.client.tsx

components/audience/
├── AudienceKpiRow.tsx          ← StatCard row: Registered, Active, Email %, Telegram %, SMS %
├── RegistrationTrendChart.tsx  ← Recharts AreaChart: daily registrations (90 days)
├── ChannelCoverageDonut.tsx    ← Recharts PieChart: email vs telegram vs sms breakdown
├── RegistrationCTAWidget.tsx   ← code snippet generator for embed CTA button
└── ReachEstimateCard.tsx       ← "If you send now, you can reach ~X users"

lib/api/analytics.ts
  ← add getAudienceAnalytics()
```

**Sidebar** — add "Audience" link under Main section.

**RegistrationCTAWidget:**

Generates a code snippet that opens `notify.useherald.xyz/register?protocol={{protocolId}}`
in a modal or new tab. Formats: `<a>` tag, React, Next.js. Uses `SyntaxBlock`

- `CopyButton`. This directly helps protocols grow their registered user count —
  a platform-level metric Herald needs to hit 5k registered identities.

---

## 12. Quota & Cost Alerts

### Why

Operators on the Growth plan (50k sends/month) who silently hit their quota
mid-month lose the ability to send notifications — including time-sensitive
liquidation warnings. That is a critical failure mode. At $0.005/notification
overage, costs can spike unexpectedly. Passive usage meters (the existing
`SidebarUsageMeter`) are not enough — operators need proactive alerts.

### Affected Repos

| Repo                            | Change Type                                   |
| ------------------------------- | --------------------------------------------- |
| `herald-admin-registration-api` | New alert config + Cron check + email trigger |
| `herald-dev-dashboard`          | New settings section + projected usage card   |

### Backend — `herald-admin-registration-api`

**1. Prisma schema** — extend `ProtocolSettings`

```prisma
model ProtocolSettings {
  // ... existing fields ...

  // Quota alert config — NEW
  quotaAlertThresholds  Int[]    @default([70, 90])  // percentages
  quotaAlertEmail       Boolean  @default(true)
  quotaAlertWebhookUrl  String?
  quotaAlertsFired      Int[]    @default([])         // tracks which thresholds already fired this period
}
```

Run: `pnpm prisma migrate dev --name add_quota_alerts`

**2. Quota alert scheduler** — `src/modules/billing/overage/overage-notification.service.ts`

This file already exists. Extend it with threshold alert logic:

```ts
@Cron("0 * * * *")  // hourly
async checkQuotaThresholds(): Promise<void>
  // For each active protocol:
  // 1. Compute usagePercent = sendsThisPeriod / tierLimit × 100
  // 2. For each threshold in quotaAlertThresholds not yet in quotaAlertsFired:
  //    if usagePercent >= threshold:
  //      send alert email (EmailService) to Owner/Admin emails
  //      if quotaAlertWebhookUrl: POST { usagePercent, threshold, projectedOverage }
  //      add threshold to quotaAlertsFired
  // 3. On period reset: clear quotaAlertsFired
```

**3. Projected usage endpoint** — `src/modules/billing/billing.controller.ts`

```
GET /billing/projection
  Returns:
  {
    currentSends: number,
    tierLimit: number,
    usagePercent: number,
    daysElapsed: number,
    daysRemaining: number,
    projectedEndOfMonth: number,
    projectedOverage: number,
    projectedOverageCost: number,
  }
```

### Frontend — `herald-dev-dashboard`

**New files:**

```
components/billing/QuotaAlertSettings.tsx    ← NEW: threshold config + webhook URL
components/billing/ProjectedUsageCard.tsx    ← NEW: projection stats card
```

**Modified files:**

```
app/(dashboard)/settings/page.client.tsx
  ← add "Usage Alerts" section using QuotaAlertSettings

app/(dashboard)/overview/page.client.tsx
  ← add ProjectedUsageCard below existing StatCards

lib/api/billing.ts
  ← add getBillingProjection(), updateQuotaAlertSettings()
```

**QuotaAlertSettings UI:**

- Threshold multi-select: checkboxes for 50% / 70% / 80% / 90% / 95%
- "Email alerts to owners and admins" toggle (Switch)
- Optional Slack webhook URL input (InputGroup with test button)
- Over-quota behavior: Radio — "Allow overage (pay per send)" / "Pause notifications at limit"

**ProjectedUsageCard:**

- Progress bar: current / tier limit
- "At current pace: X sends by end of month"
- If over projected: amber warning "Projected overage: ~$Y"
- "Upgrade plan" button if within 20% of limit

---

## 13. Webhook Reliability Dashboard

### Why

The `WebhookDeliveryLog.tsx` already shows per-webhook delivery history. What
is missing is an _aggregate_ reliability view — uptime %, failure rate, P99
latency — across all webhooks. Protocols building critical workflows on Herald
webhook events (e.g., "when notification.failed, page on-call") need confidence
that the webhook layer itself is healthy. Silent failure at 40% success rate
is worse than knowing about it.

### Affected Repos

| Repo                            | Change Type                                             |
| ------------------------------- | ------------------------------------------------------- |
| `herald-admin-registration-api` | New reliability aggregation endpoint                    |
| `herald-dev-dashboard`          | New reliability summary in webhook list + overview card |

### Backend — `herald-admin-registration-api`

**New endpoint** — `src/modules/webhook/webhook.controller.ts`

```
GET /webhooks/reliability
  Returns: {
    webhooks: [
      {
        id: string,
        url: string,
        successRateLast7Days: number,    // %
        p99LatencyMs: number,
        totalDeliveries: number,
        failedDeliveries: number,
        healthStatus: "healthy" | "degraded" | "failing",
      }
    ],
    overallSuccessRate: number,
  }
```

**Service logic** — `src/modules/webhook/webhook.service.ts`

Aggregate `WebhookDelivery` records for last 7 days per webhook:

- `successRate` = successful / total
- `p99LatencyMs` = 99th percentile of `responseTimeMs` column
- `healthStatus` = `> 99%` → healthy, `90–99%` → degraded, `< 90%` → failing

### Frontend — `herald-dev-dashboard`

**Modified files:**

```
components/webhooks/WebhookList.tsx
  ← add reliability summary row: success rate badge + P99 latency chip + health indicator dot

app/(dashboard)/overview/page.client.tsx
  ← add WebhookHealthCard (small summary card: overall success rate + failing count)
```

**New files:**

```
components/webhooks/WebhookReliabilityBadge.tsx
  ← color-coded badge: green (healthy) / amber (degraded) / red (failing)

lib/api/webhooks.ts
  ← add getWebhookReliability()
```

**WebhookList reliability row** (per webhook):

Add a secondary row or expanded column under each webhook URL showing:
`● Healthy  99.2%  P99: 312ms  [7d]`

Color: green dot for healthy, amber for degraded, red for failing.

**Overview card:**

```
Webhook Health
Overall: 98.7%  ● Healthy
2 endpoints · 0 failing
[View webhooks →]
```

---

## Sprint 3 — Continued

---

## 14. Full Audit Log UI

### Why

The `AuditLog` model and `audit.interceptor.ts` already exist in the admin API —
the infrastructure is built but there is no UI surface for it. Enterprise teams
and multi-member protocols need answers to: "Who deleted that webhook?" "When
was the API key revoked?" "Did someone change the sender domain?" This is
required by enterprise security reviews and is a natural complement to the
existing 4-role RBAC system.

### Affected Repos

| Repo                            | Change Type                                           |
| ------------------------------- | ----------------------------------------------------- |
| `herald-admin-registration-api` | New audit log endpoint (infrastructure already built) |
| `herald-dev-dashboard`          | New `/team/audit-log` page                            |

### Backend — `herald-admin-registration-api`

**New endpoint** — `src/modules/team/team.controller.ts`

```
GET /team/audit-log
  Query: page, limit, actorId?, action?, resourceType?, startDate?, endDate?
  Auth: Owner | Admin role only (RbacGuard)
  Returns: paginated AuditLog[]
```

**Service** — `src/modules/team/team.service.ts`

```ts
async getAuditLog(protocolId: string, filters: AuditLogFiltersDto) {
  return this.prisma.auditLog.findMany({
    where: {
      protocolId,
      ...(filters.actorId && { actorId: filters.actorId }),
      ...(filters.action && { action: { contains: filters.action } }),
      ...(filters.resourceType && { resourceType: filters.resourceType }),
      createdAt: { gte: filters.startDate, lte: filters.endDate },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit,
    skip: filters.offset,
  });
}
```

**CSV export endpoint:**

```
GET /team/audit-log/export
  Auth: Owner only
  Returns: text/csv attachment
```

### Frontend — `herald-dev-dashboard`

**New files:**

```
app/(dashboard)/team/audit-log/
├── page.tsx
└── page.client.tsx

components/team/
├── AuditLogTable.tsx       ← paginated table
├── AuditLogFilters.tsx     ← actor select, action type, date range
├── AuditLogRow.tsx         ← row with expandable before/after JSON diff
└── AuditLogExportButton.tsx

lib/api/team.ts
  ← add getAuditLog(filters), exportAuditLog()
```

**Modified files:**

```
app/(dashboard)/team/page.client.tsx
  ← add "Audit Log" tab or link (visible only to Owner/Admin)
```

**AuditLogTable columns:**

- Timestamp (relative)
- Actor (team member initials avatar + email last 4 chars for privacy)
- Action (human-readable label: "Created API key", "Deleted webhook", "Invited team member")
- Resource (resource type + truncated ID)
- IP (hashed — show "●●●●●" with tooltip "IP is hashed for privacy")
- Expand → side drawer with `oldValue` / `newValue` JSON diff (Monaco read-only)

**Access control:** page hidden from Sidebar for Developer and Read-only roles.
Route guard: redirect to `/overview` if role < Admin.

---

## 15. In-Dashboard Changelog & Product Updates

### Why

Developers miss platform updates unless they actively follow Herald's social
channels or newsletter. New features go unused. Breaking SDK changes go
unnoticed. SDK deprecations cause silent failures. An in-dashboard changelog
solves this at zero extra subscription cost for the user and creates a
retention touchpoint for Herald.

### Affected Repos

| Repo                   | Change Type                                            |
| ---------------------- | ------------------------------------------------------ |
| `herald-dev-dashboard` | New drawer component + changelog content + TopNav bell |

### Frontend — `herald-dev-dashboard`

**No backend changes required.** Changelog entries are static MDX files
shipped with the dashboard (updated on deploy). This keeps latency zero and
avoids a round-trip for what is essentially static content.

**New files:**

```
content/changelog/
├── 2026-05-01-sdk-v1-5.mdx
├── 2026-04-15-webhook-reliability.mdx
├── 2026-04-01-template-marketplace.mdx
└── ...

components/changelog/
├── ChangelogDrawer.tsx       ← slide-over drawer
├── ChangelogEntry.tsx        ← individual entry (date, title, description, tag)
└── ChangelogBadge.tsx        ← unread count bubble on TopNav bell

lib/
└── changelog.ts              ← imports + sorts MDX entries, computes unread count

lib/stores/ui.store.ts
  ← add: lastReadChangelog: string (ISO date), markChangelogRead() action
```

**Modified files:**

```
components/layout/TopNav.tsx
  ← add bell icon (BellIcon from phosphor) with ChangelogBadge

lib/stores/ui.store.ts
  ← extend with changelog state (persisted to localStorage)
```

**ChangelogDrawer:**

- Width: 420px, slides from right
- Header: "What's New" + "Mark all as read" button
- Each `ChangelogEntry`:
  - Date chip (e.g., "May 1, 2026")
  - Tag chip: `Feature` / `Improvement` / `Fix` / `Deprecation`
  - Title (bold)
  - 2–3 sentence description
  - Optional "Learn more →" link to `docs.useherald.xyz`
- Unread entries highlighted with a left teal border and soft background
- `lastReadChangelog` stored in Zustand (persisted to `localStorage`)
- Unread count = entries newer than `lastReadChangelog`

**ChangelogBadge:**

Small red dot (not a number — avoids notification anxiety) on the bell icon
in TopNav when there are unread entries. Disappears when drawer is opened.

**Changelog MDX format:**

````mdx
---
title: SDK v1.5 — Multi-channel targeting
date: 2026-05-01
tag: Feature
---

`@herald-protocol/sdk` v1.5 adds per-channel targeting, letting you send
to email only, Telegram only, or any combination in a single call.

```ts
await herald.notify({ wallet, channels: ["telegram"] });
```
````

````

**`lib/changelog.ts`:**

```ts
import { glob } from "glob";
import matter from "gray-matter";

export function getChangelogEntries() {
  // Read all MDX files from content/changelog/
  // Parse frontmatter, sort by date desc
  // Return: { title, date, tag, content, slug }[]
}
````

---

## Cross-Cutting Concerns

### Shared Prisma Migration Order

Run migrations in this order (they share the same database):

```bash
# In herald-admin-registration-api OR herald-notification-gateway (same DB):
pnpm prisma migrate dev --name add_api_request_log        # Feature 1
pnpm prisma migrate dev --name add_retry_policy           # Feature 3
pnpm prisma migrate dev --name add_api_key_scopes         # Feature 6
pnpm prisma migrate dev --name add_campaigns              # Feature 7
pnpm prisma migrate dev --name add_scheduled_notifications # Feature 8
pnpm prisma migrate dev --name add_notification_engagement # Feature 9
pnpm prisma migrate dev --name add_marketplace_templates   # Feature 10
pnpm prisma migrate dev --name add_quota_alerts           # Feature 12
```

After each migration, run `pnpm prisma generate` in **both** repos
(they share the schema but each has its own Prisma client instance).

### New Environment Variables

**`herald-notification-gateway/.env`**

```env
# Feature 9 — Engagement tracking
ENGAGEMENT_TRACKING_BASE_URL=https://api.useherald.xyz

# Feature 8 — Scheduled notifications
SCHEDULER_RECONCILE_CRON="*/5 * * * *"
```

**`herald-admin-registration-api/.env`**

```env
# Feature 12 — Quota alerts
QUOTA_CHECK_CRON="0 * * * *"
```

### Shared Internal Service Auth Pattern

Features 7 and 8 require the admin API to call the gateway (campaign enqueue,
schedule enqueue). Use the existing `INTERNAL_API_KEY` pattern already
established in `InternalServiceGuard` in both repos. No new auth infrastructure
needed.

### Role Enforcement Summary

| Feature                 | Minimum Role to Configure | Minimum Role to View |
| ----------------------- | ------------------------- | -------------------- |
| API Key Scoping         | Owner / Admin             | Developer            |
| Environment Promotion   | Owner / Admin             | Developer            |
| Retry Policy            | Owner / Admin             | All                  |
| Quota Alerts            | Owner / Admin             | All                  |
| Audit Log               | Owner / Admin             | Owner / Admin        |
| Campaigns               | Developer+                | All                  |
| Scheduled Notifications | Developer+                | All                  |

### React Query Key Conventions (Dashboard)

Follow existing patterns in `lib/api/`:

```ts
["requestLogs", filters][("audience", "analytics")][ // Feature 1 // Feature 11
  ("webhooks", "reliability")
][("auditLog", filters)]["campaigns"]["scheduledNotifications"][ // Feature 13 // Feature 14 // Feature 7 // Feature 8
  ("engagementMetrics", dateRange)
]["marketplaceTemplates"]["billingProjection"]; // Feature 9 // Feature 10 // Feature 12
```

---

_This document is the authoritative implementation reference for the Herald
platform feature roadmap. Update the relevant section when implementation
begins on each feature and mark completed items with a ✅._
