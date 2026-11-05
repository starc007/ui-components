import { defineRouting } from "next-intl/routing";
import languages from "./languages.json";

/**
 * i18n/languages.json has one row per language — the only place a language is
 * declared (JSON so next.config.mjs can read it too). To add one: add a row,
 * copy messages/<any translated locale>/ to messages/<code>/, translate.
 * Routing, the language menu, hreflang, sitemap and redirects all read it.
 */
export const LANGUAGES = languages;

export type Locale = keyof typeof LANGUAGES;

export const routing = defineRouting({
  locales: Object.keys(LANGUAGES) as Locale[],
  defaultLocale: "en",
  // English keeps today's URLs; other languages get a prefix (/de/...).
  localePrefix: "as-needed",
  // The URL alone picks the language, so a shared link renders the same for everyone.
  localeDetection: false,
  // Detection is off, so the cookie is never read. Skipping it keeps static
  // HTML cacheable (no Set-Cookie).
  localeCookie: false,
});

/** Path for `pathname` ("/components/motion") in `locale`. */
export function localizedPath(pathname: string, locale: Locale) {
  if (locale === routing.defaultLocale) return pathname;
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}
