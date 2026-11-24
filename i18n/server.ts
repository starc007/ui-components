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
 * The messages client components read on every page. `Pages` copy stays out:
 * each page's server function returns its own subtree, which `PageMessages`
 * (`src/routes/-pages/page-messages.tsx`) merges in, so one page's prose is
 * not shipped in every other page's HTML.
 */
export function clientMessages() {
  const { Pages: _pages, ...shared } = messages;
  return { ...shared, Pages: {} };
}

export type ClientMessages = ReturnType<typeof clientMessages>;
