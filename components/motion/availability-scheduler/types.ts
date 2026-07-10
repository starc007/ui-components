export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TimeRange = { id: string; start: string; end: string };
export type DayAvailability = { enabled: boolean; ranges: TimeRange[] };
export type WeekAvailability = Record<DayKey, DayAvailability>;
export type TimeOption = { value: string; label: string };

export const WEEKDAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

// ─── time helpers ────────────────────────────────────────────────────────────

export const toMinutes = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
};

export const toValue = (mins: number) => {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const label12 = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

export function buildOptions(step: number): TimeOption[] {
  const out: TimeOption[] = [];
  for (let m = 0; m < 24 * 60; m += step) {
    const value = toValue(m);
    out.push({ value, label: label12(value) });
  }
  return out;
}

// Default: Mon–Fri 9–5, weekend off. Fixed ids so SSR and first client render
// agree (new ranges get counter ids afterwards).
export function defaultWeek(): WeekAvailability {
  const workday = (day: DayKey): DayAvailability => ({
    enabled: true,
    ranges: [{ id: `${day}-0`, start: "09:00", end: "17:00" }],
  });
  const off = (day: DayKey): DayAvailability => ({
    enabled: false,
    ranges: [{ id: `${day}-0`, start: "09:00", end: "17:00" }],
  });
  return {
    mon: workday("mon"),
    tue: workday("tue"),
    wed: workday("wed"),
    thu: workday("thu"),
    fri: workday("fri"),
    sat: off("sat"),
    sun: off("sun"),
  };
}
