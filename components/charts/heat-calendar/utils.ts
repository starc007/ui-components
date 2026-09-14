/** Five buckets: 0 is the neutral empty cell, 1 to 4 mix the one hue in harder. */
export const STEPS = [0, 24, 46, 70, 94] as const;

export const EMPTY = "color-mix(in srgb, var(--foreground) 6%, transparent)";

/** Cell size and gap; every position in the grid and the tooltip derive from these. */
export const CELL = 16;

export const GAP = 4;

export const PITCH = CELL + GAP;

export const MONTH_ROW = 12;

export const DAYS = Array.from({ length: 7 }, (_, d) => ({ id: `d${d}`, d }));

/** How far a cell rises when it is the hovered one, its neighbour, or two away. */
export const LIFT = [1.3, 1.08, 1.03];

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};

/** Monday on or before `d`, so every column reads Mon to Sun, top to bottom. */
export const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getUTCDay() + 6) % 7));

export const fmtDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

export const fmtMonth = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" });

export const fmtRange = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
