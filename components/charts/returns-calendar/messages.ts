/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const returnsCalendarMessages = {
  year: "Year",
  monthCell: "{month} {year} {value}%",
  yearCell: "{year} {value}% for the year",
  years: "{count} years",
  months: "{count} months",
  forYear: "for the year",
};

export type ReturnsCalendarMessages = typeof returnsCalendarMessages;
