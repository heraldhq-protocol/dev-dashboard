/**
 * Herald Design Tokens
 * Source of truth for all colors, typography, and animation constants.
 * Copy this file to both repos. Never hardcode hex values in components.
 */

export const colors = {
	navy: "#060D18",
	"navy-2": "#0A1628",
	card: "#0D1F35",
	"card-2": "#112240",
	border: "#0E2A3D",
	"border-2": "#1A3A52",
	teal: "#00C896",
	"teal-2": "#00E5A8",
	"teal-dim": "#007A5C",
	"text-primary": "#FFFFFF",
	"text-secondary": "#CBD5E1",
	"text-muted": "#64748B",
	red: "#D63031",
	green: "#27AE60",
	gold: "#E8920A",
	purple: "#5B35D5",
} as const;

export const fonts = {
	sans: "'Syne', system-ui, sans-serif",
	mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

export const typography = {
	h1: { size: "2.25rem", weight: 800, leading: 1.1 },
	h2: { size: "1.75rem", weight: 700, leading: 1.2 },
	h3: { size: "1.5rem", weight: 600, leading: 1.3 },
	"body-lg": { size: "1rem", weight: 400, leading: 1.7 },
	body: { size: "0.875rem", weight: 400, leading: 1.6 },
	small: { size: "0.75rem", weight: 400, leading: 1.5 },
	"mono-lg": { size: "0.875rem", weight: 400, leading: 1.5 },
} as const;

export const animation = {
	/** Standard easing for UI transitions */
	ease: [0.22, 1, 0.36, 1] as const,
	/** Duration for page/step transitions */
	pageDuration: 0.3,
	/** Duration for staggered reveals */
	staggerDuration: 0.5,
	/** Stagger delay between children */
	staggerDelay: 0.1,
} as const;

/** Category-specific colors for tags/badges */
export const categoryMeta = {
	defi: {
		label: "DeFi",
		bg: "rgba(214,48,49,0.12)",
		text: "#F87171",
		border: "rgba(214,48,49,0.25)",
		dot: colors.teal,
	},
	governance: {
		label: "Governance",
		bg: "rgba(91,53,213,0.15)",
		text: "#A78BFA",
		border: "rgba(91,53,213,0.3)",
		dot: colors.purple,
	},
	system: {
		label: "System",
		bg: "rgba(232,146,10,0.12)",
		text: "#FBD06A",
		border: "rgba(232,146,10,0.25)",
		dot: colors.gold,
	},
	marketing: {
		label: "Marketing",
		bg: "rgba(100,116,139,0.15)",
		text: colors["text-muted"],
		border: "rgba(100,116,139,0.2)",
		dot: colors["text-muted"],
	},
} as const;

export type NotificationCategory = keyof typeof categoryMeta;
