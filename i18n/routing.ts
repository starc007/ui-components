import languages from "./languages.json";

/**
 * i18n/languages.json has one row per language — the only place a language is
 * declared (JSON so next.config.mjs can read it too). To add one: add a row,
 * copy messages/<any translated locale>/ to messages/<code>/, translate.
 * Routing, the language menu, hreflang, sitemap and redirects all read it.
 */
export const LANGUAGES = languages;

export type Locale = keyof typeof LANGUAGES;

/**
 * English keeps today's URLs; other languages get a prefix (/de/...). The URL
 * alone picks the language (no detection, no cookie), so a shared link renders
 * the same for everyone and every page can be static HTML.
 */
export const routing = {
  locales: Object.keys(LANGUAGES) as Locale[],
  defaultLocale: "en" as Locale,
};

export function hasLocale(locale: unknown): locale is Locale {
  return typeof locale === "string" && Object.hasOwn(LANGUAGES, locale);
}

/** The `{-$locale}` route param, which is undefined for English. */
export function localeFromParam(param: string | undefined): Locale | undefined {
  if (param === undefined) return routing.defaultLocale;
  return param !== routing.defaultLocale && hasLocale(param) ? param : undefined;
}

/** Path for `pathname` ("/components/motion") in `locale`. */
export function localizedPath(pathname: string, locale: Locale) {
  if (locale === routing.defaultLocale) return pathname;
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}
