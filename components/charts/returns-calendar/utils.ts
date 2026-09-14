import type { ReturnsCalendarCell } from "./types";

export const UP = "var(--success)";

export const DOWN = "var(--destructive)";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const COLS = MONTHS.map((name, m) => ({ name, initial: name[0], m }));

/** The compounded column, addressed like a thirteenth month. */
export const YEAR = 12;

/** Compounded return of a run of percentages, in percent. */
export const compound = (run: number[]) => (run.reduce((acc, r) => acc * (1 + r / 100), 1) - 1) * 100;

export const signed = (v: number, dp: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(dp)}`;

/** A hue as text: on the light page its lightness is capped so 11px numbers reach AA while the chroma stays, in dark it is native (`--ink-l` flips per theme on the root). */
export const ink = (c: string) => `oklch(from ${c} min(l, var(--ink-l, 1)) c h)`;

/** magnitude → strength of the one up or down hue, never a second color */
export const tint = (v: number, range: number, on: boolean) =>
  `color-mix(in srgb, ${v >= 0 ? UP : DOWN} ${Math.round(Math.min(Math.abs(v) / range, 1) * 55 + (on ? 24 : 8))}%, transparent)`;

export const same = (a: ReturnsCalendarCell | null, y: number, m: number) => a?.y === y && a?.m === m;

export const RING = "inset 0 0 0 1.5px var(--foreground)";
