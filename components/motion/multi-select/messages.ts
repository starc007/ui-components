import type { useMessages } from "@/lib/i18n";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const multiSelectMessages = {
  valuePlaceholder: "Select options",
  removeValue: "Remove {label}",
  inputLabel: "Search options",
  inputPlaceholder: "Search…",
  listLabel: "Options",
  empty: "No options found.",
};

export type MultiSelectMessages = typeof multiSelectMessages;

/** The resolved translator the root hands to its parts. */
export type MultiSelectTranslate = ReturnType<
  typeof useMessages<MultiSelectMessages>
>;
