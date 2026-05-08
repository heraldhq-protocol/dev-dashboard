# Herald Dashboard — Onboarding Tour (`heraldMainTour`)

> **How to update tour copy:** Edit the step entries below, then sync the `content` field into the
> matching step in `components/providers/OnboardingTourProvider.tsx`. No other files need changing.
>
> **To target a new in-page element:**
>
> 1. Add an `id` attribute to the JSX element you want to highlight
> 2. Add a new step block here with that `selector`
> 3. Add the corresponding step object in `OnboardingTourProvider.tsx`
>
> **To re-fire for ALL users** (e.g. after a major feature drop):
> bump `TOUR_VERSION` in `lib/stores/onboarding.store.ts`

---

## Adding Per-Page / Per-Component Tour Steps

Any element in any page can be targeted by giving it an `id`:

```tsx
// In any page component:
<Button id="create-api-key-btn">Create Key</Button>

// Then in OnboardingTourProvider.tsx:
{
  selector: "#create-api-key-btn",
  side: "bottom",
  title: "Create a Key",
  content: "Click here to open the key creation modal..."
}
```

You can also create **separate named sub-tours** per page:

```tsx
// Define a second tour array entry:
{ tour: "apiKeysTour", steps: [...] }

// Trigger it on page mount:
startNextStep("apiKeysTour")
```

Track separate tours in `onboarding.store.ts` using additional boolean fields.

---

## Current Tour ID Map

| DOM `id`                    | Page       | What it targets             |
| --------------------------- | ---------- | --------------------------- |
| `sidebar-overview`          | Sidebar    | Overview nav link           |
| `sidebar-analytics`         | Sidebar    | Analytics nav link          |
| `sidebar-playground`        | Sidebar    | Playground nav link         |
| `sidebar-api-keys`          | Sidebar    | API Keys nav link           |
| `sidebar-webhooks`          | Sidebar    | Webhooks nav link           |
| `sidebar-templates`         | Sidebar    | Templates nav link          |
| `sidebar-domains`           | Sidebar    | Domains nav link            |
| `sidebar-notifications`     | Sidebar    | Notifications nav link      |
| `sidebar-billing`           | Sidebar    | Billing nav link            |
| `sidebar-team`              | Sidebar    | Team nav link               |
| `sidebar-settings`          | Sidebar    | Settings nav link           |
| `overview-status-strip`     | Overview   | Network health banner       |
| `overview-metrics`          | Overview   | 4-up KPI cards row          |
| `overview-volume-chart`     | Overview   | Area chart card             |
| `overview-failures`         | Overview   | Recent failures card        |
| `playground-channel-toggle` | Playground | Email/Telegram/SMS tabs     |
| `playground-composer`       | Playground | Full editor + preview panel |
| `playground-send-btn`       | Playground | "Send Test" action button   |
| `create-api-key-btn`        | API Keys   | "Create Key" button         |
| `apikeys-security-banner`   | API Keys   | Security warning banner     |
| `apikeys-live-section`      | API Keys   | Live keys table section     |
| `apikeys-test-section`      | API Keys   | Test keys table section     |
| `webhooks-add-btn`          | Webhooks   | "Add Endpoint" button       |
| `webhooks-list`             | Webhooks   | Webhook endpoint list       |
| `restart-tour-btn`          | Settings   | "Restart Tour" button       |

---

## Tour Steps: `heraldMainTour` (26 steps)

### Step 1 — Welcome (modal)

- **selector:** `null`
- **icon:** 👋
- **title:** Welcome to Herald
- **content:** Herald is your developer control panel for sending wallet-native notifications to any Solana address — via Telegram, Email, and SMS. This quick tour walks you through every section so you're ready to ship in minutes.

---

### Step 2 — Overview page intro

- **selector:** `#sidebar-overview`
- **icon:** 📊
- **title:** Overview — Your Command Centre
- **content:** The Overview page is your real-time pulse on the Herald network. Everything your protocol sends flows through here.

### Step 3 — Network Status strip

- **selector:** `#overview-status-strip`
- **icon:** 🟢
- **title:** Network Status
- **content:** This strip shows live Herald network health. If any delivery service is degraded, it turns amber or red — so you catch issues before your users do.

### Step 4 — KPI Metrics

- **selector:** `#overview-metrics`
- **icon:** 📈
- **title:** KPI Metrics
- **content:** Four live counters: Total Sends, Delivery Rate, Average Latency, and Active Webhooks. Each shows a sparkline trend so you can spot drops at a glance. All numbers update in real-time.

### Step 5 — Volume Chart

- **selector:** `#overview-volume-chart`
- **icon:** 📉
- **title:** Notification Volume Chart
- **content:** An area chart of your daily notification volume. Toggle between 7-day and 30-day views using the buttons at the top right of the card. Hover any point to see exact send counts for that day.

### Step 6 — Recent Failures

- **selector:** `#overview-failures`
- **icon:** 🚨
- **title:** Recent Failures
- **content:** When notifications fail to deliver, they surface here with the recipient wallet, channel, and error reason. Click 'View all logs →' to open the full Notifications history with filtering.

---

### Step 7 — Analytics

- **selector:** `#sidebar-analytics`
- **icon:** 📈
- **title:** Analytics
- **content:** Deeper performance data: channel-by-channel breakdown, delivery rates over time, and volume by notification category. Use this to see which channels are performing best for your users.

---

### Step 8 — Playground page intro

- **selector:** `#sidebar-playground`
- **icon:** 🧪
- **title:** Playground
- **content:** The Playground is where you compose and preview notifications before going live — no API calls, no code needed. It's the fastest way to validate your message content.

### Step 9 — Channel Selector

- **selector:** `#playground-channel-toggle`
- **icon:** 📡
- **title:** Channel Selector
- **content:** Switch between Email, Telegram, and SMS using the tabs at the top of the composer. Each channel has its own editor — content is saved independently per channel so you can draft all three at once.

### Step 10 — Composer + Preview

- **selector:** `#playground-composer`
- **icon:** ✍️
- **title:** Composer + Live Preview
- **content:** The left panel is your editor — write your notification body with full markdown and variable support (e.g. {{wallet_address}}). The right panel shows a real-time preview of exactly how the message will appear to recipients.

### Step 11 — Send Test button

- **selector:** `#playground-send-btn`
- **icon:** 🚀
- **title:** Send Test
- **content:** Hit 'Send Test' to fire the notification to a real recipient right now. You'll be prompted for a wallet address, email, or Telegram ID depending on the active channel. The delivery uses your sandbox API key automatically.

---

### Step 12 — API Keys page intro

- **selector:** `#sidebar-api-keys`
- **icon:** 🔑
- **title:** API Keys
- **content:** API Keys are how your backend authenticates with the Herald gateway. Every notification you send must include a key in the Authorization header.

### Step 13 — Security Warning

- **selector:** `#apikeys-security-banner`
- **icon:** ⚠️
- **title:** Security Warning
- **content:** This banner appears on every visit for a reason — live keys bypass the sandbox and perform real actions. Never put them in client-side code or commit them to git. Use environment variables only.

### Step 14 — Live Keys section

- **selector:** `#apikeys-live-section`
- **icon:** 🟢
- **title:** Live Keys
- **content:** Live keys (hrld*live*...) send real notifications to real wallet addresses on the Herald network. Create one here when you're ready to go live. The key is only shown once — copy it immediately.

### Step 15 — Test Keys section

- **selector:** `#apikeys-test-section`
- **icon:** 🟡
- **title:** Sandbox (Test) Keys
- **content:** Test keys (hrld*test*...) route all notifications to your sandbox contacts instead of real wallets. Use these during development. Set your test email/Telegram/phone in Settings → Sandbox Test Contacts.

### Step 16 — Create Key button

- **selector:** `#create-api-key-btn`
- **icon:** ➕
- **title:** Create a Key
- **content:** Click 'Create Key' to open the key creation modal. Choose a name, environment (live vs. test), and the permission scopes your integration needs. Tip: Ctrl/⌘ + N opens this modal from anywhere on the page.

---

### Step 17 — Webhooks page intro

- **selector:** `#sidebar-webhooks`
- **icon:** ⚡
- **title:** Webhooks
- **content:** Webhooks let your backend receive real-time HTTP callbacks whenever Herald emits a delivery event. Use them to trigger retries, update your DB, or fire alerts.

### Step 18 — Endpoint List

- **selector:** `#webhooks-list`
- **icon:** 📋
- **title:** Endpoint List
- **content:** All your registered webhook endpoints appear here with their URL, active status toggle, and a 'View Logs' button. You can enable/disable endpoints without deleting them — useful during maintenance.

### Step 19 — Add Endpoint button

- **selector:** `#webhooks-add-btn`
- **icon:** 🔗
- **title:** Adding an Endpoint
- **content:** Click 'Add Endpoint' to register a new webhook URL. You'll subscribe it to specific events — notification.sent, notification.failed, notification.bounced, apikey.created, or apikey.revoked. Herald will POST a signed payload to your URL for each event.

---

### Step 20 — Templates

- **selector:** `#sidebar-templates`
- **icon:** 📝
- **title:** Templates
- **content:** Templates let you pre-define notification content with dynamic variables like {{protocol_name}} or {{amount}}. Reference a template by ID in your API payload — Herald substitutes the variables at send time. One template, unlimited personalised messages.

---

### Step 21 — Domains

- **selector:** `#sidebar-domains`
- **icon:** 🌐
- **title:** Domains
- **content:** To send branded emails, you need to verify your domain here. Herald walks you through adding SPF, DKIM, and DMARC records to your DNS. Without verification, emails fall back to the Herald shared domain and may land in spam.

---

### Step 22 — Notifications log

- **selector:** `#sidebar-notifications`
- **icon:** 🔔
- **title:** Notification Logs
- **content:** Every notification you've ever sent lives here — filterable by channel (Email, Telegram, SMS), status (sent, failed, bounced), wallet address, or date range. Click any row to inspect the full payload, delivery timestamp, and error details.

---

### Step 23 — Billing

- **selector:** `#sidebar-billing`
- **icon:** 💳
- **title:** Billing
- **content:** Monitor your usage against your current plan's limits. When you're approaching limits, upgrade here to unlock higher quotas and priority delivery. Invoices are downloadable per billing period.

---

### Step 24 — Team

- **selector:** `#sidebar-team`
- **icon:** 👥
- **title:** Team
- **content:** Invite teammates to your protocol workspace via email. Assign roles to control access — for example, give engineers API key access without letting them touch billing or danger-zone actions.

---

### Step 25 — Settings

- **selector:** `#sidebar-settings`
- **icon:** ⚙️
- **title:** Settings
- **content:** Configure your protocol's identity — logo, website, sender name — and manage sandbox test contacts, brand assets, Telegram button limits, and the danger zone. You can also restart this tour anytime from Settings → Tour & Onboarding.

---

### Step 26 — Finish (modal)

- **selector:** `null`
- **icon:** 🚀
- **title:** You're all set!
- **content:** You've seen everything Herald has to offer. Your next step: (1) Create a test API key, (2) Open the Playground and send a test notification, (3) Set up a webhook to receive delivery events. Welcome to Herald — let's build something great.

---

## Changelog

| Date       | Change                             | Tour version |
| ---------- | ---------------------------------- | ------------ |
| 2026-05-08 | Initial 26-step comprehensive tour | v1           |
