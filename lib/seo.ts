import type { JsonLdSchema } from "@/components/app/analytics/json-ld";
import {
  type CategoryEntry,
  type ComponentEntry,
  allComponents,
  registry,
} from "@/lib/registry";
import { SITE_URL } from "@/lib/site";

export const SITE = SITE_URL;
export const SITE_NAME = "beUI";
export const SITE_TAGLINE = "The motion toolkit for React & Next.js";
export const SITE_DESCRIPTION =
  "The motion toolkit for React and Next.js. Free, open-source, shadcn-compatible components built on Framer Motion and Tailwind CSS. Copy-paste the source or install with the shadcn CLI.";
export const AUTHOR = "Saurabh";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE}${path}`);

const KEYWORD_SUFFIXES = [
  "component",
  "React component",
  "Next.js component",
  "Tailwind component",
  "framer motion component",
  "shadcn component",
  "animation",
  "example",
];
const KEYWORD_PREFIXES = ["", "animated ", "free ", "best "];

const BASE_KEYWORDS = [
  "React motion component",
  "best motion components",
  "free motion components",
  "open source motion components",
  "framer motion component",
  "best framer motion components",
  "Tailwind CSS component",
  "shadcn registry",
  "beUI",
];

/**
 * Long-tail keyword set for a component, generated from its name and category
 * plus any hand-tuned `keywords`. Deduped, order-stable.
 */
export function componentKeywords(
  cat: CategoryEntry,
  comp: ComponentEntry,
): string[] {
  const perName = KEYWORD_SUFFIXES.flatMap((suffix) =>
    KEYWORD_PREFIXES.map((prefix) => `${prefix}${comp.name} ${suffix}`.trim()),
  );
  return Array.from(
    new Set([
      comp.name,
      ...perName,
      ...(comp.keywords ?? []),
      cat.name,
      ...BASE_KEYWORDS,
    ]),
  );
}

/**
 * Meta/social description for a component: its own description plus a short,
 * keyword-bearing positioning tail. The on-page copy keeps the bare
 * description; only the SERP/social snippet carries the tail.
 */
export function componentMetaDescription(comp: ComponentEntry): string {
  return `${comp.description} Free, open-source React and Next.js motion component. Copy-paste the source or install with shadcn.`;
}

/** Site-wide WebSite + SoftwareApplication. Rendered once in the root layout. */
export function siteJsonLd(): JsonLdSchema[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE}/#org` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: SITE_NAME,
      url: SITE,
      slogan: SITE_TAGLINE,
      logo: abs("/beui-mark.png"),
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: SITE_NAME,
      alternateName: "beUI motion toolkit",
      slogan: SITE_TAGLINE,
      description: SITE_DESCRIPTION,
      url: SITE,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      author: { "@type": "Person", name: AUTHOR },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ];
}

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/** Per-component page: SoftwareSourceCode + TechArticle. */
export function componentJsonLd(
  cat: CategoryEntry,
  comp: ComponentEntry,
): JsonLdSchema {
  const url = abs(`/components/${cat.slug}/${comp.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: `${comp.name} · React motion component`,
    name: comp.name,
    description: comp.description,
    url,
    image: abs(`/api/og?component=${comp.slug}`),
    inLanguage: "en",
    isPartOf: { "@id": `${SITE}/#website` },
    author: { "@type": "Person", name: AUTHOR },
    publisher: { "@id": `${SITE}/#org` },
    about: {
      "@type": "SoftwareSourceCode",
      name: comp.name,
      description: comp.description,
      codeRepository: "https://github.com/starc007/ui-components",
      programmingLanguage: "TypeScript",
      runtimePlatform: "React",
      codeSampleType: "full (compile ready)",
    },
  };
}

/** Category landing page: CollectionPage listing its components. */
export function categoryJsonLd(cat: CategoryEntry): JsonLdSchema {
  const url = abs(`/components/${cat.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: `${cat.name} · ${SITE_NAME}`,
    description: cat.description,
    url,
    isPartOf: { "@id": `${SITE}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cat.components.length,
      itemListElement: cat.components.map((comp, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: comp.name,
        url: abs(`/components/${cat.slug}/${comp.slug}`),
      })),
    },
  };
}

export type RelatedComponent = {
  category: string;
  slug: string;
  name: string;
  description: string;
  badge?: "new";
};

/**
 * Related components for internal cross-linking. Prefers same-category
 * siblings, then fills from the wider catalog. Deterministic ordering.
 */
export function relatedComponents(
  categorySlug: string,
  slug: string,
  limit = 4,
): RelatedComponent[] {
  const cat = registry.find((c) => c.slug === categorySlug);
  const siblings = (cat?.components ?? [])
    .filter((c) => c.slug !== slug)
    .map((c) => toRelated(categorySlug, c));

  if (siblings.length >= limit) return siblings.slice(0, limit);

  const rest = allComponents()
    .filter((c) => c.category.slug !== categorySlug)
    .map((c) => toRelated(c.category.slug, c));

  return [...siblings, ...rest].slice(0, limit);
}

function toRelated(categorySlug: string, c: ComponentEntry): RelatedComponent {
  return {
    category: categorySlug,
    slug: c.slug,
    name: c.name,
    description: c.description,
    badge: c.badge,
  };
}
