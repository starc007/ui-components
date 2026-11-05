import type { useMessages } from "@/lib/i18n";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const comboboxMessages = {
  valuePlaceholder: "Select an option",
  inputLabel: "Search options",
  inputPlaceholder: "Search…",
  listLabel: "Options",
  empty: "No options found.",
};

export type ComboboxMessages = typeof comboboxMessages;

/** The resolved translator the root hands to its parts. */
export type ComboboxTranslate = ReturnType<typeof useMessages<ComboboxMessages>>;
