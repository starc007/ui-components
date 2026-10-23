import type { Metadata } from "next";
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
  const image = `/api/og?${kind === "guides" ? "guide" : "alternative"}=${page.slug}`;
  const ogTitle = `${page.title} · beUI`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description: page.description,
      url: path,
      type: "article",
      siteName: "beUI",
      images: [{ url: image, width: 1200, height: 630, alt: page.heading }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: page.description,
      images: [image],
    },
  };
}
