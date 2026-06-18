import type { MetadataRoute } from "next";
import { allComponents, registry } from "@/lib/registry";

const SITE = "https://beui.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/llms.txt`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/r`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/docs/ai-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = registry.map((c) => ({
    url: `${SITE}/components/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const componentPages: MetadataRoute.Sitemap = allComponents().flatMap((c) => [
    {
      url: `${SITE}/components/${c.category.slug}/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE}/r/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE}/r/${c.slug}/raw`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ]);

  return [...staticPages, ...categoryPages, ...componentPages];
}
