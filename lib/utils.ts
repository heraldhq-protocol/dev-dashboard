import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict } from "date-fns";
import bs58 from "bs58";

/**
 * Merge Tailwind classes — use everywhere instead of string concatenation.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Truncate a Solana wallet address for display.
 * "7xR4mKp2nQwB" → "7xR4...nQwB" (default 4 chars each side)
 */
export function truncateAddress(address: string, chars = 4): string {
	if (!address) return "";
	if (address.length <= chars * 2 + 3) return address;
	return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a date into relative time.
 * "2m ago", "3h ago", "5d ago"
 */
export function relativeTime(date: string | Date): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return formatDistanceToNowStrict(d, { addSuffix: true });
}

/**
 * Format large numbers for display.
 * 48291 → "48.3K", 1200000 → "1.2M"
 */
export function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toString();
}

/**
 * Validate a Solana public key.
 * Returns true if base58-decodable to exactly 32 bytes.
 */
export function isValidSolanaPubkey(address: string): boolean {
	try {
		const decoded = bs58.decode(address);
		return decoded.length === 32;
	} catch {
		return false;
	}
}

/** Tailwind-compatible class strings per notification category */
export const categoryColors: Record<string, string> = {
	defi: "text-red-400 bg-red-500/10 border-red-500/25",
	governance: "text-purple-400 bg-purple-500/15 border-purple-500/30",
	system: "text-amber-300 bg-amber-500/12 border-amber-500/25",
	marketing: "text-slate-400 bg-slate-500/15 border-slate-500/20",
};

/** Display labels for protocol tiers */
export const tierLabels: Record<number, string> = {
	0: "Developer",
	1: "Growth",
	2: "Scale",
	3: "Enterprise",
};
