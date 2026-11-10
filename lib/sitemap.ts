import {
  categoryPath,
  componentPath,
  NATIVE_PATH,
  nativeComponentPath,
} from "@/lib/component-paths";
import { allComponents, registry } from "@/lib/registry";
import { componentDates } from "@/lib/component-dates";
import { native } from "@/lib/native";
import { seoPagePath, seoPages } from "@/lib/seo-pages";
import { changelogEntries } from "@/lib/changelog";
import { SITE_URL as SITE } from "@/lib/site";
import { LANGUAGES, localizedPath, routing } from "@/i18n/routing";

type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: "weekly" | "monthly";
  priority?: number;
  alternates?: { languages: Record<string, string> };
};

// The Next.js MetadataRoute names, kept so the entries below read the same.
declare namespace MetadataRoute {
  type Sitemap = SitemapEntry[];
}

/** One entry per language, each listing every language as an alternate. */
function withLanguages(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return entries.flatMap((entry) => {
    const path = entry.url.slice(SITE.length) || "/";
    const languages = {
      ...Object.fromEntries(
        routing.locales.map((locale) => [LANGUAGES[locale].hreflang, `${SITE}${localizedPath(path, locale)}`]),
      ),
      // Matches the page <head> alternates (localeAlternates).
      "x-default": `${SITE}${path}`,
    };
    return routing.locales.map((locale) => ({
      ...entry,
      url: `${SITE}${localizedPath(path, locale)}`,
      alternates: { languages },
    }));
  });
}

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** sitemap.xml with hreflang alternates, written by scripts/build-static.ts. */
export function sitemapXml() {
  const urls = sitemap()
    .map((entry) => {
      const alternates = Object.entries(entry.alternates?.languages ?? {})
        .map(
          ([hreflang, href]) =>
            `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
        )
        .join("");
      return [
        "<url>",
        `<loc>${escapeXml(entry.url)}</loc>`,
        alternates,
        entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : "",
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "",
        entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : "",
        "</url>",
      ].join("");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function sitemap(): MetadataRoute.Sitemap {
  const components = allComponents();
  const newestComponentDate = components
    .map((component) => componentDates(component.category.slug, component.slug).updatedAt)
    .sort()
    .at(-1);
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: newestComponentDate, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/docs/ai-agents`, lastModified: "2026-07-04", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/motion-patterns`, lastModified: "2026-07-09", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/openui`, lastModified: "2026-08-13", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/native-setup`, lastModified: "2026-10-16", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/theme`, lastModified: "2026-07-04", changeFrequency: "monthly", priority: 0.6 },
  ];
  // English-only content (articles stay English in every language) and machine endpoints.
  const englishOnlyPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/changelog`, lastModified: changelogEntries[0]?.date, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/llms.txt`, lastModified: newestComponentDate, changeFrequency: "weekly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = registry.map((category) => {
    const lastModified = category.components
      .map((component) => componentDates(category.slug, component.slug).updatedAt)
      .sort()
      .at(-1);
    return {
      url: `${SITE}${categoryPath(category.slug)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  // Component detail pages are the primary content. Machine endpoints
  // (/r/* JSON and raw text) are intentionally excluded from search.
  const componentPages: MetadataRoute.Sitemap = components.map((c) => ({
    url: `${SITE}${componentPath(c.category.slug, c.slug)}`,
    lastModified: componentDates(c.category.slug, c.slug).updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // beUI Native's own pages, at /react-native.
  const nativeLaunch = "2026-10-16";
  const nativePages: MetadataRoute.Sitemap = [
    { url: `${SITE}${NATIVE_PATH}`, lastModified: nativeLaunch, changeFrequency: "weekly", priority: 0.8 },
    ...native.components.map((component) => ({
      url: `${SITE}${nativeComponentPath(component.slug)}`,
      lastModified: nativeLaunch,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  // Comparison and tutorial pages. Nothing on the site links to them, so the
  // sitemap is how crawlers find them.
  const landingPages: MetadataRoute.Sitemap = (["alternatives", "guides"] as const).flatMap(
    (kind) =>
      seoPages(kind).map((page) => ({
        url: `${SITE}${seoPagePath(kind, page.slug)}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  );

  return [
    ...withLanguages([...staticPages, ...categoryPages, ...componentPages, ...nativePages]),
    ...englishOnlyPages,
    ...landingPages,
  ];
}
