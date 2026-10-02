import type { DateRange } from "./types";

export const DAY = 86_400_000;
export function parse(date: string) {
  const time = Date.parse(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(time) ||
    new Date(time).toISOString().slice(0, 10) !== date
  )
    throw new Error(`Invalid calendar date: ${date}. Use YYYY-MM-DD.`);
  return time;
}
export function iso(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}
export function monthOf(date: string) {
  return `${date.slice(0, 7)}-01`;
}
export function shiftMonth(date: string, offset: number) {
  const day = new Date(parse(date));
  const month = new Date(parse(monthOf(date)));
  month.setUTCMonth(month.getUTCMonth() + offset);
  const end = new Date(month);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  month.setUTCDate(Math.min(day.getUTCDate(), end.getUTCDate()));
  return iso(month.getTime());
}
export function ordered(a: string, b: string): Required<DateRange> {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}
