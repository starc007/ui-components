import chrome from "@/messages/en/chrome.json";
import components from "@/messages/en/components.json";
import docs from "@/messages/en/docs.json";
import landing from "@/messages/en/landing.json";
import metadata from "@/messages/en/metadata.json";
import native from "@/messages/en/native.json";
import pages from "@/messages/en/pages.json";
import { englishCatalog, englishGuides } from "./english-catalog";
import { mergeMessages } from "./merge";
import type { Locale } from "./routing";

/**
 * English is the source of truth and always complete. Each area is one file
 * per language: messages/<locale>/<area>.json. The object key is the
 * next-intl namespace. English catalog and guides come from the registry.
 */
export const englishMessages = {
  Metadata: metadata,
  Chrome: chrome,
  Landing: landing,
  Docs: docs,
  Pages: pages,
  Native: native,
  Catalog: englishCatalog,
  Guides: englishGuides,
  Components: components,
};

const en = englishMessages;

export type SiteMessages = typeof englishMessages;

type Loader = (locale: Locale) => Promise<{ default: unknown }>;

// One variable per import path: the bundler can't resolve a path built from two.
const LOADERS: Record<keyof SiteMessages, Loader> = {
  Metadata: (locale) => import(`../messages/${locale}/metadata.json`),
  Chrome: (locale) => import(`../messages/${locale}/chrome.json`),
  Landing: (locale) => import(`../messages/${locale}/landing.json`),
  Docs: (locale) => import(`../messages/${locale}/docs.json`),
  Pages: (locale) => import(`../messages/${locale}/pages.json`),
  Native: (locale) => import(`../messages/${locale}/native.json`),
  Catalog: (locale) => import(`../messages/${locale}/catalog.json`),
  Guides: (locale) => import(`../messages/${locale}/guides.json`),
  Components: (locale) => import(`../messages/${locale}/components.json`),
};

/**
 * Every language has one file per area (copy messages/en to start one).
 * Keys missing from a file fall back to English.
 */
export async function loadMessages(locale: Locale): Promise<SiteMessages> {
  if (locale === "en") return en;
  const entries = await Promise.all(
    (Object.keys(LOADERS) as (keyof SiteMessages)[]).map(async (namespace) => {
      const file = await LOADERS[namespace](locale);
      return [namespace, mergeMessages(en[namespace], file.default)] as const;
    }),
  );
  return Object.fromEntries(entries) as SiteMessages;
}
