import { LANGUAGES, type Locale, localizedPath, routing } from "./routing";

/** canonical + hreflang links for a page at `path` (English path, e.g. "/docs/theme"). */
export function localeAlternates(path: string, locale: Locale) {
  const languages: Record<string, string> = { "x-default": path };
  for (const each of routing.locales) {
    languages[LANGUAGES[each].hreflang] = localizedPath(path, each);
  }
  return { canonical: localizedPath(path, locale), languages };
}
