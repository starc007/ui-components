// Writes .build/pages.json: every page path in every language, for the
// prerender step in vite.config.ts. Link crawling would miss pages nothing
// links to (guides and alternatives are only in the sitemap).
import { mkdir, writeFile } from "node:fs/promises";
import { localizedPath, routing } from "../i18n/routing";
import { SITE_URL } from "../lib/site";
import { sitemap } from "../lib/sitemap";

// Pages the sitemap leaves out but that still need HTML. (/components is a
// redirect in _redirects, written by build-static.)
const EXTRA_PAGES = ["/sponsors", "/playground", "/404"];

const englishPaths = new Set<string>(EXTRA_PAGES);
for (const entry of sitemap()) {
  const path = entry.url.slice(SITE_URL.length) || "/";
  // Machine files (llms.txt) come from build-static, not the router.
  if (/\.[a-z]+$/i.test(path)) continue;
  englishPaths.add(routing.locales.reduce((english, locale) => {
    const prefix = `/${locale}`;
    return locale !== routing.defaultLocale && (english === prefix || english.startsWith(`${prefix}/`))
      ? english.slice(prefix.length) || "/"
      : english;
  }, path));
}

const paths = [...englishPaths].flatMap((path) =>
  routing.locales.map((locale) => localizedPath(path, locale)),
);

await mkdir(".build", { recursive: true });
await writeFile(".build/pages.json", JSON.stringify([...new Set(paths)].sort(), null, 2));
console.log(`Listed ${new Set(paths).size} pages for prerendering.`);
