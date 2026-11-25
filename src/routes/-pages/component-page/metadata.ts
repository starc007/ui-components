import { componentPath } from "@/lib/component-paths";
import { type Metadata, pageMetadata } from "@/lib/head";
import { ogImagePath } from "@/lib/og-paths";
import type { ComponentEntry } from "@/lib/registry";
import { variantPath } from "@/lib/variant-pages";

export function componentMetadata({
  catSlug,
  comp,
  keywords,
  title,
  description,
  imageAlt,
  variant,
}: {
  catSlug: string;
  comp: ComponentEntry;
  keywords: string[];
  title: string;
  description: string;
  imageAlt: string;
  /** A variant page: its own path, social card and single registry item. */
  variant?: { slug: string; installSlug: string };
}): Metadata {
  const installSlugs = variant
    ? [variant.installSlug]
    : (comp.examples?.flatMap((example) =>
        example.installSlug ? [example.installSlug] : [],
      ) ?? []);
  const registryItem = installSlugs[0] ? `/r/${installSlugs[0]}.json` : `/r/${comp.slug}.json`;
  const directoryItem = installSlugs[0] ? `/${installSlugs[0]}.json` : `/${comp.slug}.json`;
  const path = variant
    ? variantPath(catSlug, comp.slug, variant.slug)
    : componentPath(catSlug, comp.slug);

  return pageMetadata({
    path,
    title,
    description,
    keywords,
    type: "article",
    image: variant
      ? ogImagePath("variant", variant.installSlug)
      : ogImagePath("component", comp.slug),
    imageAlt,
    types: {
      "application/json": variant
        ? `/r/${variant.installSlug}.json`
        : installSlugs.length > 0
          ? `/r/${comp.slug}`
          : `/r/${comp.slug}.json`,
      "text/plain": `/r/${comp.slug}/raw`,
      // The same docs as Markdown, for an agent that fetched the HTML.
      "text/markdown": `${path}.md`,
    },
    other: {
      "beui:category": catSlug,
      "beui:component": comp.slug,
      "beui:registry-item": registryItem,
      "beui:directory-item": directoryItem,
      ...(installSlugs.length > 0
        ? { "beui:variant-registry-items": installSlugs.map((slug) => `/r/${slug}.json`) }
        : {}),
    },
  });
}
