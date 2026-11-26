// Every date format the picker shows, built once per locale. The grid
// re-renders on each hover preview, and building Intl formatters is costly.

export type DateFormats = ReturnType<typeof buildFormats>;

const cache = new Map<string, DateFormats>();

function buildFormats(locale: string) {
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
  const weekdayLong = format({ weekday: "long" });
  const weekdayShort = format({ weekday: "short" });
  return {
    /** "March 2026": the grid heading. */
    month: format({ month: "long", year: "numeric" }),
    /** "March". */
    monthName: format({ month: "long" }),
    /** "Mar". */
    shortMonthName: format({ month: "short" }),
    /** "Tuesday, March 3, 2026": announced dates. */
    date: format({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    /** "Mar 3, 2026". */
    short: format({ month: "short", day: "numeric", year: "numeric" }),
    /** "Mar 3": a range start in the same year as its end. */
    shortNoYear: format({ month: "short", day: "numeric" }),
    /** Column headings, Sunday first (2026-01-04 was a Sunday). */
    weekdays: Array.from({ length: 7 }, (_, index) => {
      const day = Date.UTC(2026, 0, 4 + index);
      return { long: weekdayLong.format(day), short: weekdayShort.format(day) };
    }),
  };
}

export function dateFormats(locale: string): DateFormats {
  let formats = cache.get(locale);
  if (!formats) {
    formats = buildFormats(locale);
    cache.set(locale, formats);
  }
  return formats;
}
