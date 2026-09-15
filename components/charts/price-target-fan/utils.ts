import type { PriceHistoryPoint } from "./types";

/** e.g. "Mon, Jul 15" — the scrub read-out's date. */
export const fmtScrubDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

export const UP = "var(--success)";

export const MID = "var(--accent)";

export const LOW = "var(--warning)";

export const W = 520;

export const H = 236;

export const PAD = { l: 36, r: 108, t: 16, b: 28 };

/** A hue as text: on the light page its lightness is capped so 11px numbers reach AA while the chroma stays, in dark it is native (`--ink-l` flips per theme on the root). */
export const ink = (c: string) => `oklch(from ${c} min(l, var(--ink-l, 1)) c h)`;

export const EMPTY_HISTORY: PriceHistoryPoint[] = [];

export const fmtAxisDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "numeric" }).format(
    new Date(date),
  );
