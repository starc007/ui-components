import type { useMessages } from "@/lib/i18n";

/**
 * English defaults. Override per instance with `labels`, or app-wide with
 * `LocaleProvider`. `{day}` is the weekday name.
 */
export const availabilitySchedulerMessages = {
  toggleDay: "Toggle {day} availability",
  unavailable: "Unavailable",
  addTime: "Add time",
  addRange: "Add time range to {day}",
  remove: "Remove",
  removeRange: "Remove time range",
  copyTimes: "Copy times",
  copyDay: "Copy {day} hours to other days",
  copyTo: "Copy times to",
  everyDay: "Every day",
  apply: "Apply",
};

export type AvailabilitySchedulerMessages = typeof availabilitySchedulerMessages;

/** The resolved translator the root hands to its parts. */
export type AvailabilitySchedulerTranslate = ReturnType<
  typeof useMessages<AvailabilitySchedulerMessages>
>;
