# Herald Design System

> **Single source of truth** for the Herald Protocol frontend design language.
> Covers all three frontend apps: Developer Dashboard, Marketing Landing Page, and User Portal.
> Feed this file to Claude Design or any AI design tool to generate UI that matches Herald's brand.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Border Radius Scale](#4-border-radius-scale)
5. [Shadows & Elevation](#5-shadows--elevation)
6. [Animation & Motion](#6-animation--motion)
7. [Design Utilities](#7-design-utilities)
8. [Component Inventory](#8-component-inventory)
9. [Layout Architecture](#9-layout-architecture)
10. [Radix UI Primitives](#10-radix-ui-primitives)
11. [shadcn Configuration](#11-shadcn-configuration)
12. [External Libraries](#12-external-libraries)

---

## 1. Brand Identity

| Attribute                 | Value                                               |
| ------------------------- | --------------------------------------------------- |
| **Product name**          | Herald Protocol                                     |
| **Tagline**               | Privacy-Preserving Notifications for Solana DeFi    |
| **Primary brand color**   | `#00C896` (Teal)                                    |
| **Secondary brand color** | `#5B35D5` / `#7C3AED` (Purple)                      |
| **Dark base**             | `#0A0F1A` (Navy)                                    |
| **Brand personality**     | Technical, trustworthy, premium, privacy-first      |
| **Tone**                  | Professional, developer-focused, security-conscious |

### Wordmark

Used in the Dashboard sidebar: gradient text from `--foreground` → `#00E5A8` → `--foreground`. Applied via `bg-linear-to-r from-foreground via-teal-2 to-foreground bg-clip-text text-transparent`.

### Icon

Custom SVG logo in `/public/logo.svg` — a bell/notification icon in teal, displayed at 32×32px in the sidebar and 40×40px on the landing page.

### URLs

| Property            | URL                            |
| ------------------- | ------------------------------ |
| Marketing site      | `https://useherald.xyz`        |
| Developer Dashboard | `https://app.useherald.xyz`    |
| User Portal         | `https://notify.useherald.xyz` |
| Documentation       | `https://useherald.xyz/docs`   |

---

## 2. Color System

All three frontends share the same core palette with minor per-repo variations. Colors defined in OKLCH internally; presented here in hex for tooling.

### Corporate Brand Seeds

| Token          | OKLCH                  | Hex                               | Role                                    |
| -------------- | ---------------------- | --------------------------------- | --------------------------------------- |
| Teal (primary) | `oklch(0.70 0.18 175)` | `#00C896`                         | CTAs, links, active states, focus rings |
| Teal-2 (hover) | —                      | `#00E5A8`                         | Button hover, bright accent             |
| Teal-dim       | —                      | `#007A5C`                         | Muted brand, disabled brand elements    |
| Purple         | —                      | `#5B35D5` / `#7C3AED`             | Governance, secondary brand             |
| Navy (dark bg) | —                      | `#0A0F1A` / `#040C18` / `#060D18` | Page backgrounds (per-app nuance)       |

### Semantic Colors (Shared)

| Token                    | Hex                               | Usage                                      |
| ------------------------ | --------------------------------- | ------------------------------------------ |
| Red (destructive)        | `#EF4444` / `#D63031`             | Errors, destructive actions, deletion      |
| Green (success)          | `#10B981` / `#22C55E` / `#27AE60` | Success states, live badges, confirmations |
| Gold / Amber (warning)   | `#F59E0B` / `#E8920A`             | Warnings, sandbox environment, caution     |
| Purple (info/governance) | `#5B35D5`                         | Governance badges, secondary brand         |

### shadcn Semantic Tokens (Dashboard — light)

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #f8fafc;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #00c896;
  --primary-foreground: #060d18;
  --secondary: #e2e8f0;
  --secondary-foreground: #1e293b;
  --muted: #e2e8f0;
  --muted-foreground: #475569;
  --accent: #e2e8f0;
  --accent-foreground: #1e293b;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #cbd5e1;
  --input: #cbd5e1;
  --ring: #00c896;
}
```

### shadcn Semantic Tokens (Dashboard — dark)

```css
.dark {
  --background: #0a0f1a;
  --foreground: #f1f5f9;
  --card: #111827;
  --card-foreground: #f1f5f9;
  --popover: #161f2e;
  --popover-foreground: #f1f5f9;
  --primary: #00c896;
  --primary-foreground: #0a0f1a;
  --secondary: #1e293b;
  --secondary-foreground: #94a3b8;
  --muted: #1e293b;
  --muted-foreground: #64748b;
  --accent: #1e293b;
  --accent-foreground: #f1f5f9;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #1e293b;
  --input: #1e293b;
  --ring: #00c896;
}
```

### Dashboard Custom Palette (dark theme)

```css
--bg-primary: #0a0f1a;
--bg-secondary: #0d1320;
--bg-card: #111827;
--bg-card-2: #1a2234;
--bg-elevated: #161f2e;
--border-main: #1e293b;
--border-alt: #334155;
--border-subtle: #0f172a;
--text-main: #f1f5f9;
--text-dim: #94a3b8;
--text-muted: #64748b;
--text-disabled: #475569;
```

### Landing Page Custom Palette (dark-forced)

```css
--bg-base: #040c18;
--bg-surface: #0a1628;
--bg-elevated: #0d1f35;
--bg-border: #0e2a3d;
--bg-border-hi: #1a3a52;
--text-primary: #f0f6ff;
--text-secondary: #94a3b8;
--text-muted: #4a607a;
--teal-glow: rgba(0, 200, 150, 0.15);
--teal-bg: rgba(0, 200, 150, 0.08);
```

### User Portal Custom Palette

```css
/* Dark */
--bg-primary: #060d18;
--bg-secondary: #0a1628;
--bg-card: #0d1f35;
--bg-card-2: #112240;
--border-main: #0e2a3d;
--border-alt: #1a3a52;
--text-main: #ffffff;
--text-dim: #cbd5e1;
--text-muted: #64748b;
--app-glow: radial-gradient(...) teal + purple ambient;

/* Light */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-card: #ffffff;
--bg-card-2: #f1f5f9;
--border-main: #e2e8f0;
--border-alt: #cbd5e1;
--text-main: #0f172a;
--text-dim: #334155;
--text-muted: #64748b;
```

### Tailwind v4 Theme Tokens (Dashboard)

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-navy: var(--bg-primary);
  --color-navy-2: var(--bg-secondary);
  --color-card-2: var(--bg-card-2);
  --color-border-2: var(--border-alt);
  --color-border-alt: var(--border-alt);
  --color-border-subtle: var(--border-subtle);

  --color-teal: #00c896;
  --color-teal-2: #00e5a8;
  --color-teal-dim: #007a5c;

  --color-text-primary: var(--text-main);
  --color-text-secondary: var(--text-dim);
  --color-text-muted: var(--text-muted);

  --color-red: #ef4444;
  --color-green: #10b981;
  --color-gold: #f59e0b;
  --color-purple: #5b35d5;

  --color-status-ok: #00c896;
  --color-status-warn: #f59e0b;
  --color-status-error: #ef4444;
  --color-status-success: #10b981;
  --color-status-success-bg: rgba(16, 185, 129, 0.1);
  --color-status-warning: #f59e0b;
  --color-status-warning-bg: rgba(245, 158, 11, 0.1);
  --color-status-error-bg: rgba(239, 68, 68, 0.1);
}
```

### Status Colors (shared across all repos)

| Token              | Hex       | Tailwind class      | Usage                                     |
| ------------------ | --------- | ------------------- | ----------------------------------------- |
| `--status-success` | `#10b981` | `bg-status-success` | Live env, success badges, positive deltas |
| `--status-warning` | `#f59e0b` | `bg-status-warning` | Sandbox env, warning badges               |
| `--status-error`   | `#ef4444` | `bg-status-error`   | Error badges, destructive states          |

---

## 3. Typography

### Font Roles

| Role                   | Dashboard                             | Landing Page   | User Portal        |
| ---------------------- | ------------------------------------- | -------------- | ------------------ |
| **Display / Headings** | **Syne** (weights 400-800)            | **Syne**       | **Syne**           |
| **Body**               | **Plus Jakarta Sans**                 | **DM Sans**    | **Syne**           |
| **Monospace**          | **JetBrains Mono** (weights 400, 500) | **Geist Mono** | **JetBrains Mono** |

### CSS Variable Mapping

```css
/* Dashboard */
--font-sans:
  var(--font-plus-jakarta), "Plus Jakarta Sans", system-ui, -apple-system,
  sans-serif;
--font-heading: var(--font-syne), "Syne", system-ui, sans-serif;
--font-mono:
  var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", monospace;

/* Landing Page */
--font-sans: var(--font-body), system-ui, sans-serif; /* DM Sans */
--font-mono: var(--font-mono), monospace; /* Geist Mono */
--font-display: var(--font-display), system-ui, sans-serif; /* Syne */

/* User Portal */
--font-sans: "Syne", system-ui, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Font Loading (Dashboard — next/font)

```tsx
// app/layout.tsx
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
```

### Type Scale (informal — based on usage across repos)

| Usage                   | Size                | Weight            | Leading                       |
| ----------------------- | ------------------- | ----------------- | ----------------------------- |
| Page title (h1)         | `text-2xl` (1.5rem) | `font-bold` (700) | `tracking-tight`              |
| Section heading (h2)    | `text-base` (1rem)  | `font-semibold`   | `tracking-tight`              |
| Card title              | `text-xl`           | `font-extrabold`  | `leading-none tracking-tight` |
| Metric value            | `text-2xl`          | `font-bold`       | `tracking-tight`              |
| Table header            | `text-xs`           | `font-semibold`   | `uppercase tracking-widest`   |
| Body / paragraph        | `text-sm`           | normal (400)      | `leading-relaxed`             |
| UI label / caption      | `text-xs`           | `font-semibold`   | normal                        |
| Section label (sidebar) | `text-[10px]`       | `font-semibold`   | `uppercase tracking-widest`   |
| Muted / secondary text  | `text-sm`           | normal            | `<p>` preset                  |
| Monospace (code)        | `text-xs`           | normal            | `font-mono`                   |

---

## 4. Border Radius Scale

```css
/* Landing page scale (set in globals.css) */
--radius: 0.625rem; /* base = 10px */
--radius-sm: calc(var(--radius) * 0.6); /* ~6px  */
--radius-md: calc(var(--radius) * 0.8); /* ~8px  */
--radius-lg: var(--radius); /* 10px  */
--radius-xl: calc(var(--radius) * 1.4); /* 14px  */
--radius-2xl: calc(var(--radius) * 1.8); /* 18px  */
--radius-3xl: calc(var(--radius) * 2.2); /* 22px  */
--radius-4xl: calc(var(--radius) * 2.6); /* 26px  */
```

### Common Usage

| Radius                      | Used on                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `rounded-none`              | Dropdown items, dialog content, tooltips, command items, popover content (dashboard aesthetic) |
| `rounded-lg` (8px)          | Buttons, cards (default), inputs, select triggers, badges, metric cards                        |
| `rounded-xl` (12px)         | Cards (glass/flat), data tables, stat cards, dashboard cards, modals                           |
| `rounded-2xl` (16px)        | Portal cards, pricing cards                                                                    |
| `rounded-full`              | Status badges (success/warning/error), avatar, delta badges                                    |
| `rounded-4xl` (shadcn nova) | Landing page badges                                                                            |

> **Note**: The Dashboard uses `rounded-none` for Radix primitives as a deliberate design choice (sharp, technical look). The Landing Page and Portal use softer radii (`rounded-xl`, `rounded-2xl`).

---

## 5. Shadows & Elevation

### Card Glow (dashboard)

```css
/* Teal glow on hover (StatCard, DashboardCard, Card variant="glow") */
--card-glow-hover: 0_4px_20px_rgba(0,0,0,0.4);

/* Applied via */
hover:border-border-2 hover:shadow-(--card-glow-hover) hover:-translate-y-px
```

### Focus Ring

```css
/* Global focus-visible style */
:focus-visible {
  outline: 2px solid rgba(0, 200, 150, 0.6);
  outline-offset: 3px;
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(0, 200, 150, 0.2);
}

/* shadcn button focus */
focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

### Drop Shadows

| Element               | Shadow                                  |
| --------------------- | --------------------------------------- |
| Dropdown menu content | `shadow-md ring-1 ring-foreground/10`   |
| Dialog content        | `ring-1 ring-foreground/10`             |
| Select content        | `shadow-2xl ring-1 ring-foreground/10`  |
| Popover content       | `shadow-md ring-1 ring-foreground/10`   |
| Metric card hover     | `shadow-[0_4px_20px_rgba(0,0,0,0.4)]`   |
| Button primary        | `shadow-sm`                             |
| Switch checked        | `shadow-[0_0_12px_rgba(0,200,150,0.4)]` |
| Switch destruct.      | `shadow-[0_0_12px_rgba(239,68,68,0.4)]` |

### Card Variant Glows (Dashboard Card component)

| Variant   | Class                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `default` | `border border-border bg-card shadow-sm`                                                             |
| `glass`   | `border border-white/10 bg-white/5 backdrop-blur-sm`                                                 |
| `glow`    | `border border-border bg-card transition hover:border-teal/20 hover:shadow-[var(--card-glow-hover)]` |
| `flat`    | `border-0 bg-card-2`                                                                                 |

---

## 6. Animation & Motion

### CSS Keyframes

```css
/* Dashboard */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* Landing Page */
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.3;
  }
}

/* User Portal */
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
```

### Tailwind Animation Classes

| Class                 | Details                                              | Used in          |
| --------------------- | ---------------------------------------------------- | ---------------- |
| `.animate-shimmer`    | Shimmer loading skeleton (1.5s ease-in-out infinite) | Dashboard        |
| `.animate-marquee`    | Logo marquee (30s / 22s linear infinite)             | Landing + Portal |
| `.animate-fade-in`    | Fade in (0.4s ease-out)                              | Landing          |
| `.animate-slide-up`   | Slide up + fade (0.5s ease-out)                      | Landing          |
| `.animate-glow-pulse` | Teal glow pulse (3s ease-in-out)                     | Landing          |
| `.animate-spin`       | Loading spinner (Tailwind built-in)                  | Dashboard Button |

### Radix / framer-motion Animations

All Radix primitives use `data-open:` and `data-closed:` states for enter/exit animations:

```css
data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95
```

`framer-motion` / `motion` (v12) used for:

- Sidebar collapse/expand transitions (Dashboard)
- Page-level entrance animations
- Marketing page scroll reveals (Landing — GSAP)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Design Utilities

### `.bg-dot-grid` (Dashboard)

Subtle teal dot-grid background for depth:

```css
.bg-dot-grid {
  background-image: radial-gradient(
    circle,
    rgba(0, 200, 150, 0.06) 1px,
    transparent 1px
  );
  background-size: 28px 28px;
}
```

Applied to the entire Dashboard body and as an overlay in `DashboardShell`.

### `.bg-app-glow` (Landing Page)

Radial teal glow from the top of the hero section:

```css
.bg-app-glow {
  background: radial-gradient(
    ellipse 80% 40% at 50% 0%,
    var(--teal-glow) 0%,
    transparent 70%
  );
}
```

### `.glow-dot` (Landing + Portal)

Teal dot that glows on hover, used behind cards:

```css
.glow-dot::after {
  content: "";
  position: absolute;
  width: 80%;
  height: 80%;
  background: var(--teal);
  top: 10%;
  left: 10%;
  filter: blur(40px);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}
.hover\:glow-dot:hover::after {
  opacity: 0.15;
}
```

### `.text-glow` (Landing Page)

Text shadow glow for emphasized headings:

```css
.text-glow {
  text-shadow: 0 0 40px rgba(0, 200, 150, 0.4);
}
```

### `.bg-grid` (Landing Page)

Grid texture for code/architecture sections:

```css
.bg-grid {
  background-image:
    linear-gradient(var(--bg-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--bg-border) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

### `.bg-noise` (Landing Page)

Subtle noise grain texture overlay:

```css
.bg-noise::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...fractalNoise...");
  pointer-events: none;
  z-index: 0;
}
```

### `.blur-email` (Portal)

Blurs email addresses for privacy preview:

```css
.blur-email {
  filter: blur(5px);
  user-select: none;
}
```

### `.animate-shimmer` (Dashboard)

Skeleton loading effect:

```css
.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-card) 25%,
    var(--bg-card-2) 50%,
    var(--bg-card) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## 8. Component Inventory

> **Legend**: `D` = Dashboard, `L` = Landing Page, `P` = User Portal
> File paths relative to each repo's `components/` directory.

### 8.1 Primitives (shadcn / Radix-based)

#### Button

| Repo  | File            | Variants                                                          | Sizes                                                                            | Notes                                                                            |
| ----- | --------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **D** | `ui/Button.tsx` | `default`, `secondary`, `ghost`, `destructive`, `link`, `outline` | `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`             | CVA-based, `asChild` via Slot, `isLoading` prop with spinner                     |
| **L** | `ui/button.tsx` | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` | `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`             | Shadcn style `radix-nova`, standard API                                          |
| **P** | `ui/Button.tsx` | `primary`, `secondary`, `ghost`, `danger`, `outline`              | `xs`, `sm`, `md`, `lg`, `xl`, `default`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | Custom CVA, `forwardRef`, `default` variant is `primary`, `default` size is `md` |

**Dashboard Button variants in detail:**

| Variant       | Classes                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `default`     | `bg-teal text-navy font-semibold hover:bg-teal-2`                                                 |
| `secondary`   | `bg-secondary text-secondary-foreground hover:bg-secondary/80`                                    |
| `ghost`       | `text-text-muted hover:text-foreground hover:bg-secondary`                                        |
| `destructive` | `bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20`         |
| `link`        | `text-teal underline-offset-4 hover:underline`                                                    |
| `outline`     | `border border-border bg-transparent text-text-muted hover:bg-secondary/50 hover:text-foreground` |

**Props**: `variant`, `size`, `asChild`, `isLoading`, plus all native `<button>` props.
`data-slot="button"` `data-variant={variant}` `data-size={size}` attributes.

---

#### Card

| Repo  | File          | Variants                           | Sub-components                                                                                  | Notes                                                   |
| ----- | ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **D** | `ui/Card.tsx` | `default`, `glass`, `glow`, `flat` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | Custom Herald variants, `size` prop (`default` \| `sm`) |
| **L** | `ui/card.tsx` | Shadcn standard                    | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | `size` prop (`default` \| `sm`), shadcn radix-nova      |
| **P** | `ui/Card.tsx` | `elevated` boolean                 | `Card` only                                                                                     | Simple wrapper, `elevated` changes to card-2 styling    |

**Dashboard Card variant styles:**

```tsx
const cardVariantStyles = {
  default:
    "rounded-lg border border-border bg-card text-text-primary shadow-sm",
  glass:
    "rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-text-primary shadow-sm",
  glow: "rounded-lg border border-border bg-card text-text-primary shadow-sm transition-all duration-300 hover:border-teal/20 hover:shadow-[var(--card-glow-hover)]",
  flat: "rounded-lg border-0 bg-card-2 text-text-primary",
};
```

**Dashboard Card sub-components styling:**

| Sub-component     | Style                                                                |
| ----------------- | -------------------------------------------------------------------- |
| `CardHeader`      | `flex flex-col space-y-1.5 p-6`                                      |
| `CardTitle`       | `font-extrabold leading-none tracking-tight text-xl text-foreground` |
| `CardDescription` | `text-sm text-text-muted`                                            |
| `CardAction`      | `col-start-2 row-span-2 row-start-1 self-start justify-self-end`     |
| `CardContent`     | `p-6 pt-0`                                                           |
| `CardFooter`      | `flex items-center p-6 pt-0`                                         |

---

#### Badge

| Repo  | File           | Variants                                                                           | Prop API                                      |
| ----- | -------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| **D** | `ui/Badge.tsx` | `default`, `success`, `warning`, `error`, `secondary`                              | `variant`, `size` (`default` \| `sm` \| `lg`) |
| **L** | `ui/badge.tsx` | `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`                  | `variant`, `asChild`                          |
| **P** | `ui/Badge.tsx` | `defi`, `governance`, `system`, `marketing`, `success`, `error`, `warning`, `info` | `variant` (8 category variants)               |

**Dashboard Badge variants:**

```css
default: "bg-teal/10 text-teal border border-teal/20"
success: "bg-status-success/10 text-status-success border border-status-success/20 rounded-full"
warning: "bg-status-warning/10 text-status-warning border border-status-warning/20 rounded-full"
error: "bg-status-error/10 text-status-error border border-status-error/20 rounded-full"
secondary: "bg-secondary text-text-muted border border-border"
```

**Portal Badge variants (category-specific):**

```css
defi: "bg-herald-red/10 text-red-400 border-herald-red/25"
governance: "bg-herald-purple/15 text-purple-400 border-herald-purple/30"
system: "bg-herald-gold/12 text-amber-300 border-herald-gold/25"
marketing: "bg-text-muted/15 text-slate-500 border-text-muted/20"
success: "bg-herald-green/10 text-herald-green border-herald-green/25"
error: "bg-herald-red/10 text-herald-red border-herald-red/25"
warning: "bg-herald-gold/10 text-herald-gold border-herald-gold/25"
info: "bg-teal/10 text-teal border-teal/25"
```

---

#### Input

| Repo  | File           | Variants | Notes                                                                        |
| ----- | -------------- | -------- | ---------------------------------------------------------------------------- |
| **D** | `ui/Input.tsx` | Standard | `h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm` |
| **L** | —              | —        | No custom Input (might use shadcn default)                                   |
| **P** | `ui/Input.tsx` | Standard | `h-8 rounded-lg`, `data-slot="input"`, follows shadcn radix-nova style       |

---

#### Textarea

| Repo  | File              | Notes                                                                           |
| ----- | ----------------- | ------------------------------------------------------------------------------- |
| **D** | `ui/textarea.tsx` | `field-sizing-content min-h-16 w-full rounded-none border border-input text-xs` |
| **P** | `ui/textarea.tsx` | Similar to dashboard, `field-sizing-content`                                    |

---

#### Select

| Repo  | File            | Sub-components                                                                                                                                                             | Notes                                                                                                                                           |
| ----- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/select.tsx` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` | Uses `@phosphor-icons/react` (CaretDown, CaretUp, Check). Size prop: `sm` \| `default`. Styled with `rounded-xl` trigger, `rounded-xl` content. |
| **P** | —               | —                                                                                                                                                                          | No custom Select component                                                                                                                      |

---

#### Switch

| Repo  | File            | Variants                 | Notes                                                                                      |
| ----- | --------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| **D** | `ui/switch.tsx` | `default`, `destructive` | CVA-based. Sizes: `default` (h-6 w-11), `sm` (h-5 w-9). Checked glow effect. `forwardRef`. |
| **P** | —               | —                        | Uses radix-ui Switch directly                                                              |

---

#### RadioGroup

| Repo  | File                 | Sub-components                 | Notes                          |
| ----- | -------------------- | ------------------------------ | ------------------------------ |
| **D** | `ui/radio-group.tsx` | `RadioGroup`, `RadioGroupItem` | Standard shadcn radix-lyra     |
| **P** | `ui/RadioGroup.tsx`  | —                              | Custom, untracked in this pass |

---

#### Tabs

| Repo  | File          | Variants          | Notes                                                                                                                       |
| ----- | ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/tabs.tsx` | `default`, `line` | `TabsList`, `TabsTrigger`, `TabsContent`. The `line` variant uses an underline indicator (absolutely positioned `::after`). |
| **P** | —             | —                 | Not present in this pass                                                                                                    |

---

#### Dialog

| Repo  | File            | Sub-components                                                                                                                                                 |
| ----- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` |
| **P** | `ui/dialog.tsx` | Similar, portal-style                                                                                                                                          |

**Dashboard Dialog specifics:**

- `DialogContent`: `rounded-xl sm:rounded-md bg-popover`, `max-h-[85vh] overflow-y-auto`
- `DialogOverlay`: `bg-black/10 backdrop-blur-xs`
- `DialogTitle`: `font-heading text-sm font-medium uppercase`
- `DialogDescription`: `text-xs/relaxed text-muted-foreground`
- `DialogFooter`: `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`
- Close button uses `Button variant="ghost" size="icon-sm"` with `XIcon`

---

#### Modal (Dashboard wrapper)

| Repo  | File           | Props                                                              |
| ----- | -------------- | ------------------------------------------------------------------ |
| **D** | `ui/Modal.tsx` | `open?`, `isOpen?`, `onClose?`, `title?`, `children`, `className?` |

Backwards-compatible wrapper over Dialog. Supports both `open` and `isOpen` prop names.

---

#### DropdownMenu

| Repo  | File                   | Sub-components                                                                                                                                                                                                                                                                                                                                          |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` |

Uses `@phosphor-icons/react` (CheckIcon, CaretRightIcon). Styled with `rounded-none` on all items (sharp aesthetic). Item variant prop: `default` | `destructive`.

---

#### Popover

| Repo  | File             | Sub-components                                                                                                        |
| ----- | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/popover.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription` |
| **P** | `ui/popover.tsx` | Similar                                                                                                               |

---

#### Tooltip

| Repo  | File             | Sub-components                                                   | Notes                                                                     |
| ----- | ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **D** | `ui/tooltip.tsx` | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` | `delayDuration` defaults to 0. `rounded-none` on content. Arrow included. |
| **P** | —                | —                                                                | Not present in this pass                                                  |

---

#### Separator

| Repo  | File               | Notes                                                                                                                             |
| ----- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/separator.tsx` | `shrink-0 bg-border`. Orientations: `horizontal` (h-[1px] w-full), `vertical` (h-full w-[1px]). From `@radix-ui/react-separator`. |
| **P** | —                  | Not present                                                                                                                       |

---

#### Command Palette (cmdk)

| Repo  | File             | Sub-components                                                                                                                                  |
| ----- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/command.tsx` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut` |

Uses `cmdk` + `@phosphor-icons/react` (MagnifyingGlassIcon, CheckIcon). `CommandDialog` wraps in Dialog with `top-1/3` positioning.

---

### 8.2 Composite / Shared Components

#### InputGroup

| Repo  | File                 | Sub-components                                                                                                 |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| **D** | `ui/input-group.tsx` | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea` |
| **P** | `ui/input-group.tsx` | Similar structure                                                                                              |

**Props**: `InputGroupAddon` accepts `align` (`inline-start` \| `inline-end` \| `block-start` \| `block-end`).
Handles keyboard + icon addons, buttons inside input groups.

---

#### DataTable

| Repo  | File                   | Props                                                  |
| ----- | ---------------------- | ------------------------------------------------------ |
| **D** | `shared/DataTable.tsx` | `columns: ColumnDef<TData, TValue>[]`, `data: TData[]` |

Thin wrapper around `@tanstack/react-table`. Styled with:

- `rounded-xl border border-border bg-card`
- `thead` with `bg-card-2 text-xs uppercase tracking-widest text-text-muted`
- Row hover: `hover:bg-card-2/50 transition-colors`
- Empty state: "No results found."

---

#### StatCard

| Repo  | File                  | Props                                                                                                                                                                                  |
| ----- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D** | `shared/StatCard.tsx` | `label`, `value`, `delta?`, `deltaType?` (positive/negative/neutral), `topRight?`, `detail?`, `sparklineData?`, `sparklineColor?`, `icon?`, `isLoading?`, `glowOnHover?`, `className?` |

Premium KPI metric card with:

- Inline SVG sparkline (zero-dependency polyline)
- Delta badge with directional arrow and color coding
- Skeleton loading state (`animate-shimmer`)
- Corner glow effect on hover
- Hover: `hover:border-border-2 hover:-translate-y-px`

---

#### MetricCard

| Repo  | File                | Props                                                                               |
| ----- | ------------------- | ----------------------------------------------------------------------------------- |
| **D** | `ui/MetricCard.tsx` | `label`, `value`, `delta?`, `deltaType?`, `detail?`, `sparklineData?`, `isLoading?` |

Alternative KPI card using Recharts `AreaChart` for sparklines. Uses bordered `<Card>` style.

---

#### DashboardCard

| Repo  | File                   | Props                                                                                       |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------- |
| **D** | `ui/DashboardCard.tsx` | `children`, `className?`, `id?`, `header?` ({ title, action }), `footer?` ({ left, right }) |

Standardized section card with header and footer slots. `rounded-xl border border-border bg-card`, hover elevation.

---

#### PageHeader

| Repo  | File                    | Props                                                                                                     |
| ----- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| **D** | `shared/PageHeader.tsx` | `title: string`, `description?: string`, `badge?: ReactNode`, `actions?: ReactNode`, `className?: string` |

Standard heading block for every dashboard page. Title uses Syne font. Right-aligned `actions` slot for CTAs/filters.

---

#### EmptyState

| Repo  | File                    | Props                                                                                                   |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| **D** | `shared/EmptyState.tsx` | `icon?: ReactNode`, `title: string`, `description?: string`, `action?: ReactNode`, `className?: string` |

Empty list/table state. Dashed border, centered layout, icon in a bordered box.

---

#### CopyButton

| Repo  | File                    | Props                                 |
| ----- | ----------------------- | ------------------------------------- |
| **D** | `shared/CopyButton.tsx` | `text: string` (extends Button props) |

Clipboard API-based copy. Shows `FaCopy` / `FaCheck` icons. 2-second success state.

---

#### SyntaxBlock

| Repo  | File                     | Props                                |
| ----- | ------------------------ | ------------------------------------ |
| **D** | `shared/SyntaxBlock.tsx` | `code: string`, `className?: string` |

Code block with CopyButton overlay on hover. `border border-border bg-navy-2 overflow-hidden`.

---

#### SolscanLink

| Repo  | File                     | Props                                                |
| ----- | ------------------------ | ---------------------------------------------------- |
| **D** | `shared/SolscanLink.tsx` | `txHash: string`, `shorten?: boolean` (default true) |

External link to Solscan transaction explorer. Format: `abcd...wxyz ↗`.

---

#### EnvironmentBadge

| Repo  | File                          | Props                   |
| ----- | ----------------------------- | ----------------------- | ------- |
| **D** | `shared/EnvironmentBadge.tsx` | `environment: "sandbox" | "live"` |

Maps to `Badge variant="warning"` for sandbox, `Badge variant="success"` for live.

---

#### PulsatingLoader

| Repo  | File                      | Notes                  |
| ----- | ------------------------- | ---------------------- |
| **D** | `ui/pulsating-loader.tsx` | Custom animated loader |

---

#### CodeEditor

| Repo  | File                | Notes                                               |
| ----- | ------------------- | --------------------------------------------------- |
| **D** | `ui/CodeEditor.tsx` | Monaco-based code editor via `@monaco-editor/react` |

---

#### Phone Input

| Repo  | File                 | Notes                                                |
| ----- | -------------------- | ---------------------------------------------------- |
| **P** | `ui/phone-input.tsx` | Wraps `react-phone-number-input` with Herald styling |

---

#### Sonner Toasts

| Repo  | Config                                                      |
| ----- | ----------------------------------------------------------- |
| **P** | `ui/sonner.tsx` — shadcn wrapper for `sonner` toast library |

---

#### ScrollArea

| Repo  | File                 |
| ----- | -------------------- |
| **P** | `ui/scroll-area.tsx` |

---

#### Toggle

| Repo  | File            |
| ----- | --------------- |
| **P** | `ui/Toggle.tsx` |

---

#### AnimatedList

| Repo  | File                                       |
| ----- | ------------------------------------------ |
| **P** | `ui/animated-list.tsx` — MagicUI component |

---

#### Loader

| Repo  | File            |
| ----- | --------------- |
| **P** | `ui/Loader.tsx` |

---

### 8.3 Feature Components

#### Analytics (Dashboard)

| File                                  | Description                                     |
| ------------------------------------- | ----------------------------------------------- |
| `analytics/CategoryBreakdownBars.tsx` | Horizontal bar chart of notification categories |
| `analytics/DateRangePicker.tsx`       | Date filter for analytics                       |
| `analytics/DeliveryStatusDonut.tsx`   | Donut chart of delivery statuses                |
| `analytics/SendsBarChart.tsx`         | Time-series bar chart of notification sends     |

#### API Keys (Dashboard)

| File                          | Description                            |
| ----------------------------- | -------------------------------------- |
| `api-keys/ApiKeyTable.tsx`    | Table of API keys (live + sandbox)     |
| `api-keys/CreateKeyModal.tsx` | Modal for creating a new API key       |
| `api-keys/KeyRevealModal.tsx` | One-time key reveal modal              |
| `api-keys/RevokeKeyModal.tsx` | Confirmation dialog for revoking a key |

#### Auth (Dashboard)

| File                 | Description                        |
| -------------------- | ---------------------------------- |
| `auth/LoginForm.tsx` | Sign-in with Solana wallet + email |

#### Billing (Dashboard)

| File                            | Description                       |
| ------------------------------- | --------------------------------- |
| `billing/CurrentPlanCard.tsx`   | Current subscription plan display |
| `billing/OverageManagement.tsx` | Usage overage controls            |
| `billing/PaymentHistory.tsx`    | Payment transaction history       |
| `billing/PricingCard.tsx`       | Pricing tier card                 |
| `billing/UsageProgressBar.tsx`  | Usage meter with progress bar     |

#### Layout (Dashboard)

| File                           | Description                             |
| ------------------------------ | --------------------------------------- |
| `layout/DashboardShell.tsx`    | Main layout: sidebar + topnav + content |
| `layout/Sidebar.tsx`           | Collapsible nav sidebar with sections   |
| `layout/SidebarUsageMeter.tsx` | Usage meter in sidebar footer           |
| `layout/ThemeToggle.tsx`       | Light/dark mode toggle                  |
| `layout/TopNav.tsx`            | Top navigation bar                      |

#### Notifications (Dashboard)

| File                                   | Description              |
| -------------------------------------- | ------------------------ |
| `notifications/NotificationsTable.tsx` | Notification log table   |
| `notifications/ReceiptProof.tsx`       | ZK receipt proof display |
| `notifications/StatusBadge.tsx`        | Delivery status badge    |

#### Onboarding (Dashboard)

| File                             | Description                         |
| -------------------------------- | ----------------------------------- |
| `onboarding/TourCard.tsx`        | Tour step card                      |
| `onboarding/TourInitializer.tsx` | Initializes 26-step onboarding tour |

#### Playground (Dashboard)

| File                              | Description                         |
| --------------------------------- | ----------------------------------- |
| `playground/channel-toggle.tsx`   | Channel toggle (email/sms/telegram) |
| `playground/composer-editor.tsx`  | Message composer editor             |
| `playground/composer-preview.tsx` | Composer preview panel              |
| `playground/EmailComposer.tsx`    | Email-specific composer             |
| `playground/EmailPreview.tsx`     | Email preview rendering             |
| `playground/preview-email.tsx`    | Email preview sub-component         |
| `playground/preview-sms.tsx`      | SMS preview sub-component           |
| `playground/preview-telegram.tsx` | Telegram preview sub-component      |
| `playground/SmsComposer.tsx`      | SMS-specific composer               |
| `playground/TelegramComposer.tsx` | Telegram-specific composer          |
| `playground/test-data-panel.tsx`  | Test data variables panel           |
| `playground/variable-chip.tsx`    | Variable chip pill                  |

#### Providers (Dashboard)

| File                                   | Description                   |
| -------------------------------------- | ----------------------------- |
| `providers/ClientProviders.tsx`        | Composes all client providers |
| `providers/OnboardingTourProvider.tsx` | Tour state provider           |
| `providers/QueryProvider.tsx`          | TanStack Query provider       |
| `providers/ThemeProvider.tsx`          | `next-themes` provider        |

#### Webhooks (Dashboard)

| File                               | Description                    |
| ---------------------------------- | ------------------------------ |
| `webhooks/WebhookDeliveryLog.tsx`  | Webhook delivery attempt log   |
| `webhooks/WebhookList.tsx`         | Webhook endpoint list          |
| `webhooks/WebhookSecretReveal.tsx` | One-time webhook secret reveal |
| `webhooks/WebhookTestButton.tsx`   | Test webhook send button       |

### 8.4 Landing Page Components

#### Marketing — Home

| File                               | Description                   |
| ---------------------------------- | ----------------------------- |
| `marketing/home/BlogStrip.tsx`     | Latest blog posts grid        |
| `marketing/home/CodePreview.tsx`   | SDK code snippet preview      |
| `marketing/home/DemoAnimation.tsx` | Animated product demo         |
| `marketing/home/DualValueProp.tsx` | Two-column value proposition  |
| `marketing/home/FeatureGrid.tsx`   | Features grid section         |
| `marketing/home/FinalCTA.tsx`      | Bottom call-to-action         |
| `marketing/home/HeroSection.tsx`   | GSAP-animated hero with stats |
| `marketing/home/HowItWorks.tsx`    | Three-step how-it-works       |
| `marketing/home/LogoMarquee.tsx`   | Partner/protocol logo marquee |
| `marketing/home/PricingTable.tsx`  | Pricing tiers comparison      |

#### Marketing — Subsections

| File                                | Section                                                   |
| ----------------------------------- | --------------------------------------------------------- |
| `marketing/how-it-works/*`          | Technical deep-dive pages                                 |
| `marketing/legal/*`                 | Privacy/Terms layout                                      |
| `marketing/pitch/PitchCarousel.tsx` | Investor pitch carousel                                   |
| `marketing/pricing/*`               | Pricing page (hero, table, calculator, spec sheet, tiers) |
| `marketing/protocol/*`              | For-protocols landing (hero, problem, use cases)          |
| `marketing/shared/*`                | NavBar, Footer, ErrorView, FeaturedIcons, HeraldIcon      |
| `marketing/users/*`                 | For-users landing (privacy, registration guide, hero)     |

#### Status Page

| File                           | Description                    |
| ------------------------------ | ------------------------------ |
| `status/ConnectionStatus.tsx`  | Real-time connection indicator |
| `status/IncidentBanner.tsx`    | Active incident alert banner   |
| `status/ResponseTimeChart.tsx` | API response time chart        |
| `status/StatusCard.tsx`        | Individual service status card |
| `status/StatusHeader.tsx`      | Status page header             |
| `status/UptimeGraph.tsx`       | Uptime percentage over time    |

#### SEO

| File             | Description                       |
| ---------------- | --------------------------------- |
| `seo/JsonLd.tsx` | JSON-LD structured data injection |

### 8.5 User Portal Components

#### Layout

| File                      | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `layout/PortalHeader.tsx` | Sticky nav with logo, links, theme toggle, register CTA |
| `layout/PortalFooter.tsx` | Simple footer with links                                |

#### Registration

| File                                  | Description                    |
| ------------------------------------- | ------------------------------ |
| `registration/RegistrationWizard.tsx` | Multi-step registration wizard |
| `registration/StepConnectWallet.tsx`  | Step 1: Connect Solana wallet  |
| `registration/StepEnterEmail.tsx`     | Step 2: Enter email address    |
| `registration/StepEncryptSign.tsx`    | Step 3: Encrypt and sign       |
| `registration/StepLogin.tsx`          | Step 4: Login/verify           |
| `registration/StepSuccess.tsx`        | Step 5: Success confirmation   |
| `registration/StepIndicator.tsx`      | Visual step progress indicator |

#### Notifications

| File                                 | Description                     |
| ------------------------------------ | ------------------------------- |
| `notifications/NotificationCard.tsx` | Individual notification display |
| `notifications/NotificationList.tsx` | Paginated notification list     |

#### Preferences

| File                                  | Description                           |
| ------------------------------------- | ------------------------------------- |
| `preferences/CategoryToggle.tsx`      | Toggle notification categories on/off |
| `preferences/ChannelStatusCard.tsx`   | Email/SMS/Telegram channel status     |
| `preferences/DeleteAccountModal.tsx`  | Account deletion confirmation         |
| `preferences/DeliveryModeSelect.tsx`  | Delivery frequency/digest mode        |
| `preferences/EmailUpdateModal.tsx`    | Change email address                  |
| `preferences/NotificationKeyCard.tsx` | E2E encryption key display            |
| `preferences/PreferencesForm.tsx`     | Preferences form wrapper              |
| `preferences/RemoveSmsModal.tsx`      | Remove SMS channel confirmation       |
| `preferences/RemoveTelegramModal.tsx` | Remove Telegram channel confirmation  |

#### Wallet

| File                              | Description                        |
| --------------------------------- | ---------------------------------- |
| `wallet/WalletAddressDisplay.tsx` | Truncated wallet address with copy |
| `wallet/WalletModal.tsx`          | Wallet connection modal            |
| `wallet/WalletStatusBadge.tsx`    | Connection status badge            |

#### Marketing (Portal)

| File                                    | Description                   |
| --------------------------------------- | ----------------------------- |
| `marketing/RegistrationInfographic.tsx` | Visual guide for registration |
| `marketing/SponsorsBanner.tsx`          | Sponsor logos                 |
| `marketing/SponsorsShowcase.tsx`        | Sponsor detail showcase       |

#### Providers (Portal)

| File                   | Description                        |
| ---------------------- | ---------------------------------- |
| `QueryProvider.tsx`    | TanStack Query provider            |
| `ThemeProvider.tsx`    | next-themes provider               |
| `ThemeToggle.tsx`      | Light/dark toggle                  |
| `WalletConnection.tsx` | Wallet connection context provider |

---

## 9. Layout Architecture

### Developer Dashboard

```
RootLayout (app/layout.tsx)
├── ClientProviders (providers/ClientProviders.tsx)
│   ├── ThemeProvider (next-themes)
│   ├── QueryProvider (TanStack Query)
│   ├── OnboardingTourProvider (NextStep)
│   └── Route groups:
│       ├── (auth) — login, callback, onboarding (no sidebar)
│       └── (dashboard) — all protected pages
│           └── DashboardShell (layout/DashboardShell.tsx)
│               ├── Sidebar (layout/Sidebar.tsx)
│               │   └── SidebarUsageMeter (layout/SidebarUsageMeter.tsx)
│               ├── TopNav (layout/TopNav.tsx)
│               │   └── ThemeToggle (layout/ThemeToggle.tsx)
│               └── <main> (scroll container, max-w-7xl)
│                   └── NextStepViewport (onboarding tour)
```

**Sidebar behavior:**

- Mobile: slide-in overlay with backdrop blur
- Desktop: collapsible (256px → 68px), tooltip on collapsed items
- 3 sections: Main, Developer, Account
- Active state: `bg-card-2/50 text-teal border-l-2 border-l-teal`
- Transition: cubic-bezier(0.25, 0.1, 0.25, 1), 350ms

**TopNav behavior:**

- Sticky top bar, 64px height
- Breadcrumb: Dashboard > {Page}
- Environment switcher (Sandbox/Live toggle)
- Theme toggle, user avatar + initials

---

### Landing Page

```
RootLayout (app/layout.tsx) — dark forced
├── ThemeProvider (forced dark, no toggle)
├── (marketing) layout.tsx
│   ├── NavBar (components/marketing/shared/NavBar.tsx)
│   │   └── Fixed top, mobile hamburger, docs/status links
│   ├── {page content}
│   └── Footer (components/marketing/shared/Footer.tsx)
│       └── 4-column footer with link groups
├── docs layout.tsx
│   └── Fumadocs DocsLayout wrapper
├── blog/**/* — blog pages
└── api/**/* — API routes (OG images, MCP)
```

---

### User Portal

```
RootLayout (app/layout.tsx)
├── ThemeProvider + WalletConnection + AuthProvider + QueryProvider
├── (marketing) layout.tsx
│   ├── PortalHeader (components/layout/PortalHeader.tsx)
│   └── PortalFooter (components/layout/PortalFooter.tsx)
├── (app) layout.tsx — auth-gated
│   ├── PortalHeader (with wallet status)
│   ├── /notifications — NotificationList
│   ├── /preferences — PreferencesForm
│   └── /register — RegistrationWizard
├── /unsubscribe — unsubscribe page
└── /api/**/* — API routes
```

---

## 10. Radix UI Primitives

All three frontends use `radix-ui` (the v4 monorepo). Primitives used across repos:

| Primitive      | Dashboard | Landing | Portal |
| -------------- | :-------: | :-----: | :----: |
| `Slot`         |     ✓     |    ✓    |   —    |
| `Dialog`       |     ✓     |    —    |   ✓    |
| `DropdownMenu` |     ✓     |    —    |   —    |
| `Popover`      |     ✓     |    —    |   ✓    |
| `RadioGroup`   |     ✓     |    —    |   ✓    |
| `Select`       |     ✓     |    —    |   —    |
| `Separator`    |  ✓ (v1)   |    —    |   —    |
| `Switch`       |     ✓     |    —    |   ✓    |
| `Tooltip`      |     ✓     |    —    |   —    |

**Package versions**: `radix-ui` ^1.4.3 (v4 monorepo), `@radix-ui/react-separator` (v1 standalone).

---

## 11. shadcn Configuration

### `components.json` per repo

| Property             | Dashboard         | Landing           | Portal            |
| -------------------- | ----------------- | ----------------- | ----------------- |
| **style**            | `radix-lyra`      | `radix-nova`      | `radix-nova`      |
| **rsc**              | `true`            | `true`            | `true`            |
| **tailwind.css**     | `app/globals.css` | `app/globals.css` | `app/globals.css` |
| **baseColor**        | `neutral`         | `neutral`         | `neutral`         |
| **cssVariables**     | `true`            | `true`            | `true`            |
| **iconLibrary**      | `phosphor`        | `lucide`          | `lucide`          |
| **aliases (ui)**     | `@/components/ui` | `@/components/ui` | `@/components/ui` |
| **aliases (lib)**    | `@/lib`           | `@/lib`           | `@/lib`           |
| **aliases (hooks)**  | `@/hooks`         | `@/hooks`         | `@/hooks`         |
| **extra registries** | —                 | —                 | `@magicui`        |

### Tailwind v4 Integration

All three repos use Tailwind CSS v4 with `@tailwindcss/postcss`:

```css
/* Shared preamble */
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
```

Colors defined via `@theme inline {}` blocks (Tailwind v4), mapping CSS custom properties to Tailwind utility classes.

---

## 12. External Libraries

### Core UI & Framework

| Library                  | Version | Used in | Purpose                |
| ------------------------ | ------- | ------- | ---------------------- |
| Next.js                  | 16.x    | D, L, P | React framework        |
| React                    | 19.x    | D, L, P | UI library             |
| Tailwind CSS             | v4      | D, L, P | Utility CSS            |
| shadcn/ui                | 4.x     | D, L, P | Component primitives   |
| radix-ui                 | 1.4.3   | D, L, P | Headless UI primitives |
| class-variance-authority | —       | D, L, P | Component variants     |
| tailwind-merge           | —       | D, L, P | Class merging          |
| clsx                     | —       | D, L, P | Conditional classes    |
| tw-animate-css           | —       | D, L, P | Tailwind v4 animations |

### Animation

| Library         | Version | Used in | Purpose                          |
| --------------- | ------- | ------- | -------------------------------- |
| motion          | 12.38   | D, P    | React animations (framer-motion) |
| framer-motion   | 12.38   | D       | Animation library                |
| GSAP            | 3.14    | L       | Marketing page animations        |
| @lordicon/react | —       | L       | Animated icons                   |
| lottie-web      | 5.13    | L       | Lottie animations                |

### Icons

| Library                 | Used in          |
| ----------------------- | ---------------- |
| `@phosphor-icons/react` | Dashboard        |
| `lucide-react`          | Landing + Portal |
| `react-icons`           | Dashboard (fa)   |

### Data & State

| Library                 | Version | Used in | Purpose           |
| ----------------------- | ------- | ------- | ----------------- |
| @tanstack/react-query   | 5.x     | D, P    | Server state      |
| @tanstack/react-table   | 8.21    | D       | Table logic       |
| @tanstack/react-virtual | 3.13    | P       | Virtualized lists |
| zustand                 | 5.x     | D, P    | Client state      |
| immer                   | —       | D, P    | Immutable state   |
| recharts                | 3.8     | D       | Charts            |

### Forms & Validation

| Library             | Version | Used in | Purpose                   |
| ------------------- | ------- | ------- | ------------------------- |
| react-hook-form     | 7.73    | P       | Form management           |
| @hookform/resolvers | 5.2     | P       | Form validation resolvers |
| zod                 | 4.x     | L, P    | Schema validation         |

### Documents & Content

| Library              | Version | Used in | Purpose                 |
| -------------------- | ------- | ------- | ----------------------- |
| fumadocs-core        | 16.7    | L       | Documentation framework |
| fumadocs-mdx         | 14.2    | L       | MDX content layer       |
| fumadocs-ui          | 16.7    | L       | Docs UI components      |
| @tiptap/react        | —       | D       | Rich text editor        |
| @monaco-editor/react | 4.7     | D       | Code editor             |
| cmdk                 | —       | D, P    | Command palette         |

### Web3 / Solana

| Library                   | Version | Used in | Purpose           |
| ------------------------- | ------- | ------- | ----------------- |
| @solana/web3.js           | 1.98    | D, P    | Solana RPC        |
| @solana/wallet-adapter-\* | —       | D, P    | Wallet connection |
| @coral-xyz/anchor         | 0.32    | P       | Solana programs   |
| @herald-protocol/sdk      | 1.x     | D, P    | Herald protocol   |
| bs58                      | —       | D, P    | Base58 encoding   |
| tweetnacl                 | —       | D, P    | Encryption        |
| ed2curve                  | —       | D, P    | Key conversion    |

### Utilities

| Library                  | Version  | Used in | Purpose             |
| ------------------------ | -------- | ------- | ------------------- |
| sonner                   | 2.x      | D, P    | Toast notifications |
| next-themes              | 0.4      | D, P    | Theme switching     |
| date-fns                 | —        | D       | Date formatting     |
| next-auth                | 5.0-beta | D       | Authentication      |
| nextstepjs               | 2.2      | D       | Onboarding tours    |
| react-resizable-panels   | —        | D       | Resizable panels    |
| react-phone-number-input | —        | P       | Phone input         |
| qrcode                   | —        | D       | QR code generation  |
| @upstash/redis           | —        | P       | Rate limiting       |
| @upstash/ratelimit       | —        | P       | Rate limiting       |
| axios                    | —        | D, P    | HTTP client         |

---

> Generated from code analysis of three repos:
> `herald-dev-dashboard`, `herald-landing-page`, `herald-user-portal`
>
> Last updated: May 2026
