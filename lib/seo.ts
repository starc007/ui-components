import type { JsonLdSchema } from "@/components/app/analytics/json-ld";
import { componentDates } from "@/lib/component-dates";
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

/** Trim text to `limit` chars on a word boundary — for fixed-size surfaces
 * like the OG image where overflow would clip or overrun the layout. */
export function clampText(text: string, limit: number): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= limit) return s;
  return `${s.slice(0, limit - 1).replace(/[\s,;:—-]+\S*$/, "")}…`;
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
  const dates = componentDates(cat.slug, comp.slug);
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
    datePublished: dates.publishedAt,
    dateModified: dates.updatedAt,
    author: {
      "@type": "Person",
      name: AUTHOR,
      url: "https://saura3h.xyz",
      sameAs: "https://github.com/starc007",
    },
    publisher: { "@id": `${SITE}/#org` },
    about: {
      "@type": "SoftwareSourceCode",
      name: comp.name,
      description: comp.description,
      codeRepository: "https://github.com/starc007/ui-components",
      license: "https://github.com/starc007/ui-components/blob/main/LICENSE",
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
 * Interaction families used to give related links a stronger signal than
 * generic words such as "animated" or "component" can provide.
 */
const RELATED_FAMILIES: readonly (readonly string[])[] = [
  ["button", "switch", "input", "select", "checkbox", "radio", "range-slider", "wheel-picker"],
  ["tabs", "shared-layout-bg", "preview-rail", "dock", "scroll-animation"],
  ["bottom-sheet", "tooltip", "popover", "morphing-modal", "drawer"],
  ["text-animation", "number", "animated-badge", "action-swap", "animated-toast-stack", "loader"],
  ["tilt-card", "marquee", "theme-toggle", "shader-background", "cylinder-carousel"],
  ["table", "input", "select", "checkbox", "radio"],
  ["command-palette", "expandable-action-bar", "overflow-actions", "expandable-tabs", "bloom-menu"],
  ["availability-scheduler", "file-upload", "otp-input", "feedback-widget"],
  ["swap", "prediction-market", "wallet-card"],
  ["dynamic-island", "swipeable-list", "not-found"],
];

const RELATED_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "animated",
  "animation",
  "component",
  "components",
  "for",
  "from",
  "motion",
  "of",
  "on",
  "or",
  "react",
  "the",
  "to",
  "with",
]);

function relatedTokens(component: ComponentEntry): Set<string> {
  const text = [
    component.slug,
    component.name,
    component.description,
    ...(component.keywords ?? []),
  ].join(" ");

  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !RELATED_STOP_WORDS.has(token)),
  );
}

function relatedScore(current: ComponentEntry, candidate: ComponentEntry) {
  const currentTokens = relatedTokens(current);
  const candidateTokens = relatedTokens(candidate);
  let score = 0;

  for (const token of currentTokens) {
    if (candidateTokens.has(token)) score += 1;
  }

  for (const family of RELATED_FAMILIES) {
    if (family.includes(current.slug) && family.includes(candidate.slug)) {
      score += 12;
    }
  }

  return score;
}

/**
 * Related components for internal cross-linking. Ranks same-category siblings
 * by interaction family and copy similarity, then uses circular catalog order
 * as a page-specific tie-breaker. Cross-category items only fill short lists.
 */
export function relatedComponents(
  categorySlug: string,
  slug: string,
  limit = 4,
): RelatedComponent[] {
  const cat = registry.find((c) => c.slug === categorySlug);
  const components = cat?.components ?? [];
  const currentIndex = components.findIndex((component) => component.slug === slug);
  const current = components[currentIndex];
  const siblingCount = components.length;
  const siblings = components
    .map((component, index) => ({
      component,
      score: current ? relatedScore(current, component) : 0,
      distance:
        currentIndex < 0
          ? index
          : (index - currentIndex + siblingCount) % siblingCount,
    }))
    .filter(({ component }) => component.slug !== slug)
    .sort((a, b) => b.score - a.score || a.distance - b.distance)
    .map(({ component }) => toRelated(categorySlug, component));

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
