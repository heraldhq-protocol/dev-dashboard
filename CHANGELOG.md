# Changelog

All notable changes to the Herald Developer Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.7.0] - 2026-05-17

### Added
- **TopNav account dropdown**: now shows protocol name, role badge, tier badge, verification shield, wallet address with copy button, and quick links to Billing and Team
- Avatar initials derived from protocol name instead of raw wallet UUID
- Breadcrumb labels extended to cover Campaigns, Scheduled, Requests, and Engagement routes

### Fixed
- TopNav trigger label was showing a raw UUID slice; now shows the protocol name

## [0.6.0] - 2026-05-17

### Added
- **Protocol verification system**: `VerificationCard` and `VerificationBadge` components surfaced on the Overview page
  - Unverified protocols can apply with a free-text reason (min 20 chars)
  - Pending / Rejected / Verified states each render distinct contextual UI
- `POST /protocols/me/request-verification` client call wired to `requestVerification` API

### Changed
- **Engagement Analytics** gate unified to `UpgradeGate` component (Growth+, tier 1)
- **Request Inspector** gate unified to `UpgradeGate` component (Scale+, tier 2)
- All plan-gated pages now use the single `UpgradeGate` → `TierGatePage` pattern

## [0.5.0] - 2026-05-17

### Added
- **API key count limits**: Developer = 1 live key, Growth = 5, Scale/Enterprise = unlimited; amber upgrade banner shown at limit
- **Webhook endpoint count limits**: Developer = 1, Growth = 5, Scale/Enterprise = unlimited; tier-lock removed, count-limit added
- **Campaign blurred preview**: Developer-tier users see a blurred dummy campaign table with an upgrade overlay instead of a hard lock wall
- **Template count limits**: Developer = 3, Growth = 10, Scale/Enterprise = unlimited; header shows `N/limit used` counter
- **Overage rates** displayed on each `PricingCard` (e.g. `+$0.002 per overage notification`)

### Changed
- Templates page no longer shows a tier-lock gate; replaced with per-tier count enforcement
- Webhooks page accessible to all tiers (count-limited rather than tier-locked)

## [0.4.0] - 2026-05-17

### Added
- `usePlanGate` hook: reads `billingStatus` cache, exposes `{ tier, isLoading, hasFeature(minTier) }`
- `UpgradeGate` component wrapping `TierGatePage` for declarative page-level gating
- Sidebar nav items carry `minTier` metadata; locked items render faded with a lock icon
- Plan gating applied to: Campaigns (tier 1), Scheduled (tier 1), Team (tier 1), Audit Log (tier 1), Domains (tier 2), Engagement (tier 1), Request Inspector (tier 2)

### Fixed
- Billing tier limits corrected to match product marketing: Scale = 250k, Enterprise = 1M
- `TIER_FEATURES` descriptions updated to match current product offering

## [0.3.0] - 2026-05-15

### Added
- Campaigns page with audience builder and segment preview
- Scheduled Notifications page with cron/one-shot scheduling UI
- Audience analytics breakdown (subscribed, opted-out, active counts)
- `ProjectedUsageCard` on Overview showing monthly burn estimate
- Webhook reliability badge and per-webhook health rows on Overview

## [0.2.0] - 2026-05-09

### Added
- Embedded SDK documentation panel (Ctrl+/ shortcut)
- Request Inspector page with filters, paginated log table, and detail drawer
- In-dashboard changelog drawer with unread indicator (bell icon)
- Starter template flow with brand variable pre-fill
- Environment promotion flow for webhooks and templates (sandbox → live)
- API key scope grouping with owner-only guard
- SEO: dynamic Open Graph image generation per page

### Fixed
- Playground body rendering for channel composers
- Email preview template rendering

## [0.1.0] - 2026-04-25

### Added
- Initial dashboard with Overview, API Keys, Webhooks, Notifications, Analytics, Billing, Team, Settings, Playground
- NextAuth v5 wallet-signature authentication
- Onboarding tour
- Billing overage management with KPI cards
- Monaco editor for template editing
- Domains page with DKIM and BIMI DNS configuration
- Sandbox test contacts configuration
- Real-time system status page
