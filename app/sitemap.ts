import type { MetadataRoute } from "next";
import { allComponents, registry } from "@/lib/registry";
import { componentDates } from "@/lib/component-dates";
import { SITE_URL as SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const components = allComponents();
  const newestComponentDate = components
    .map((component) => componentDates(component.category.slug, component.slug).updatedAt)
    .sort()
    .at(-1);
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: newestComponentDate, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/docs/ai-agents`, lastModified: "2026-07-04", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/motion-patterns`, lastModified: "2026-07-09", changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/theme`, lastModified: "2026-07-04", changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/llms.txt`, lastModified: newestComponentDate, changeFrequency: "weekly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = registry.map((category) => {
    const lastModified = category.components
      .map((component) => componentDates(category.slug, component.slug).updatedAt)
      .sort()
      .at(-1);
    return {
      url: `${SITE}/components/${category.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  // Component detail pages are the primary content. Machine endpoints
  // (/r/* JSON and raw text) are intentionally excluded from search.
  const componentPages: MetadataRoute.Sitemap = components.map((c) => ({
    url: `${SITE}/components/${c.category.slug}/${c.slug}`,
    lastModified: componentDates(c.category.slug, c.slug).updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...componentPages];
}
