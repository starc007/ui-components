import type { MetadataRoute } from "next";
import { allComponents, registry } from "@/lib/registry";
import { SITE_URL as SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/docs/ai-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/motion-patterns`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/docs/theme`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/llms.txt`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = registry.map((c) => ({
    url: `${SITE}/components/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Component detail pages are the primary content. Machine endpoints
  // (/r/* JSON and raw text) are intentionally excluded from search.
  const componentPages: MetadataRoute.Sitemap = allComponents().map((c) => ({
    url: `${SITE}/components/${c.category.slug}/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...componentPages];
}
