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
import { BLOG_PATH, blogPostPath, blogPosts } from "@/lib/blog";
import { allVariantPages, variantPath } from "@/lib/variant-pages";
import { SITE_URL as SITE } from "@/lib/site";

type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: "weekly" | "monthly";
  priority?: number;
};

/** Escapes text for XML element content and attribute values. */
export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** sitemap.xml, written by scripts/build-static.ts. */
export function sitemapXml() {
  const urls = sitemap()
    .map((entry) => {
      return [
        "<url>",
        `<loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : "",
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "",
        entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : "",
        "</url>",
      ].join("");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemap(): SitemapEntry[] {
  const components = allComponents();
  const newestComponentDate = components
    .map((component) => componentDates(component.category.slug, component.slug).updatedAt)
    .sort()
    .at(-1);
  const staticPages: SitemapEntry[] = [
    { url: `${SITE}/`, lastModified: newestComponentDate, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/docs/ai-agents`, lastModified: "2026-07-04", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/motion-patterns`, lastModified: "2026-07-09", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/openui`, lastModified: "2026-08-13", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/native-setup`, lastModified: "2026-10-16", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/theme`, lastModified: "2026-11-24", changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/themes`, lastModified: "2026-11-24", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/brand`, lastModified: "2026-11-27", changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE}/terms`, lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE}/refunds`, lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.2 },
  ];
  const feedPages: SitemapEntry[] = [
    { url: `${SITE}/changelog`, lastModified: changelogEntries[0]?.date, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/llms.txt`, lastModified: newestComponentDate, changeFrequency: "weekly", priority: 0.5 },
  ];

  const categoryPages: SitemapEntry[] = registry.map((category) => {
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
  const componentPages: SitemapEntry[] = components.map((c) => ({
    url: `${SITE}${componentPath(c.category.slug, c.slug)}`,
    lastModified: componentDates(c.category.slug, c.slug).updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const variantPages: SitemapEntry[] = allVariantPages().map(({ category, comp, example }) => ({
    url: `${SITE}${variantPath(category, comp.slug, example.slug)}`,
    lastModified: componentDates(category, comp.slug).updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // beUI Native's own pages, at /react-native.
  const nativeLaunch = "2026-10-16";
  const nativePages: SitemapEntry[] = [
    { url: `${SITE}${NATIVE_PATH}`, lastModified: nativeLaunch, changeFrequency: "weekly", priority: 0.8 },
    ...native.components.map((component) => ({
      url: `${SITE}${nativeComponentPath(component.slug)}`,
      lastModified: nativeLaunch,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  // Comparison and tutorial pages, with their /guides and /alternatives lists
  // (linked from the footer).
  const landingPages: SitemapEntry[] = (["alternatives", "guides"] as const).flatMap(
    (kind) => [
      {
        url: `${SITE}/${kind}`,
        lastModified: seoPages(kind)
          .map((page) => page.updatedAt)
          .sort()
          .at(-1),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
      ...seoPages(kind).map((page) => ({
        url: `${SITE}${seoPagePath(kind, page.slug)}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ],
  );

  const posts = blogPosts();
  const blogPages: SitemapEntry[] = [
    {
      url: `${SITE}${BLOG_PATH}`,
      lastModified: posts[0]?.publishedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: `${SITE}${blogPostPath(post.slug)}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticPages,
    ...blogPages,
    ...categoryPages,
    ...componentPages,
    ...variantPages,
    ...nativePages,
    ...feedPages,
    ...landingPages,
  ];
}
