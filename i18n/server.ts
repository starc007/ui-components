import { createFormatter, createTranslator, type NamespaceKeys, type NestedKeyOf } from "use-intl/core";
import { LOCALE, messages, type SiteMessages } from "./messages";

/**
 * Translation outside React, for static server functions (page metadata).
 * Components use `useTranslations` from use-intl.
 */
export function getTranslations<
  Namespace extends NamespaceKeys<SiteMessages, NestedKeyOf<SiteMessages>> = never,
>(namespace?: Namespace) {
  return createTranslator({ locale: LOCALE, messages, namespace });
}

export function getFormatter() {
  return createFormatter({ locale: LOCALE, timeZone: "UTC" });
}

/**
 * The messages client components read. Long docs prose in `Pages` stays in
 * the server functions that render those pages.
 */
export function clientMessages() {
  const { Pages, ...shared } = messages;
  return {
    ...shared,
    Pages: {
      motionPatterns: Pages.motionPatterns,
      playground: Pages.playground,
      sponsors: Pages.sponsors,
    },
  };
}

export type ClientMessages = ReturnType<typeof clientMessages>;
