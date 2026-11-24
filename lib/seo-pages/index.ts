import { type Metadata, pageMetadata } from "@/lib/head";
import { ogImagePath } from "@/lib/og-paths";
import { alternativePages } from "@/lib/seo-pages/alternatives";
import { guidePages } from "@/lib/seo-pages/guides";
import type { AlternativePage, SeoPage, SeoPageKind } from "@/lib/seo-pages/types";

export function seoPagePath(kind: SeoPageKind, slug: string) {
  return `/${kind}/${slug}`;
}

export function seoPages(kind: "alternatives"): AlternativePage[];
export function seoPages(kind: "guides"): SeoPage[];
export function seoPages(kind: SeoPageKind): SeoPage[];
export function seoPages(kind: SeoPageKind): SeoPage[] {
  return kind === "alternatives" ? alternativePages : guidePages;
}

export function findSeoPage(kind: SeoPageKind, slug: string) {
  return seoPages(kind).find((page) => page.slug === slug);
}

export function seoPageMetadata(kind: SeoPageKind, page: SeoPage): Metadata {
  const path = seoPagePath(kind, page.slug);
  return pageMetadata({
    path,
    title: page.title,
    description: page.description,
    type: "article",
    image: ogImagePath(kind === "guides" ? "guide" : "alternative", page.slug),
    imageAlt: page.heading,
    types: { "text/markdown": `${path}.md` },
  });
}
