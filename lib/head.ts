import { SITE_URL } from "@/lib/site";

/**
 * The page metadata shape the site was written against (a subset of
 * Next.js's `Metadata`). Pages build one in their static server function and
 * the route's `head()` turns it into tags with `metadataToHead`.
 */
export type OgImage = { url: string; width?: number; height?: number; alt?: string };

export type Metadata = {
  title?: string | { absolute: string };
  description?: string;
  keywords?: string[];
  robots?: { index?: boolean; follow?: boolean };
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
    types?: Record<string, string>;
  };
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    type?: "website" | "article";
    siteName?: string;
    locale?: string;
    images?: (string | OgImage)[];
    publishedTime?: string;
    modifiedTime?: string;
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    title?: string;
    description?: string;
    images?: (string | OgImage)[];
  };
  /** Extra `<meta name content>` pairs; arrays emit one tag per value. */
  other?: Record<string, string | string[]>;
};

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };
type LinkTag = { rel: string; href: string; hrefLang?: string; type?: string };

const TITLE_SUFFIX = " · beUI";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function pageTitle(title: NonNullable<Metadata["title"]>) {
  return typeof title === "string" ? `${title}${TITLE_SUFFIX}` : title.absolute;
}

/**
 * Tags for one route. Nested routes override their parents' title and named
 * meta, so a page only sets what differs from the site layout's defaults.
 */
export function metadataToHead(metadata: Metadata) {
  const meta: MetaTag[] = metadata.title ? [{ title: pageTitle(metadata.title) }] : [];
  const links: LinkTag[] = [];
  const named = (name: string, content: string | undefined) => {
    if (content) meta.push({ name, content });
  };
  const property = (name: string, content: string | undefined) => {
    if (content) meta.push({ property: name, content });
  };

  named("description", metadata.description);
  if (metadata.keywords?.length) named("keywords", metadata.keywords.join(", "));
  if (metadata.robots) {
    named(
      "robots",
      [metadata.robots.index === false ? "noindex" : "index", metadata.robots.follow === false ? "nofollow" : "follow"].join(", "),
    );
  }

  const { alternates, openGraph, twitter } = metadata;
  if (alternates?.canonical) links.push({ rel: "canonical", href: absoluteUrl(alternates.canonical) });
  for (const [hrefLang, href] of Object.entries(alternates?.languages ?? {})) {
    links.push({ rel: "alternate", hrefLang, href: absoluteUrl(href) });
  }
  for (const [type, href] of Object.entries(alternates?.types ?? {})) {
    links.push({ rel: "alternate", type, href: absoluteUrl(href) });
  }

  if (openGraph) {
    property("og:title", openGraph.title);
    property("og:description", openGraph.description);
    property("og:url", openGraph.url && absoluteUrl(openGraph.url));
    property("og:site_name", openGraph.siteName);
    property("og:locale", openGraph.locale);
    property("og:type", openGraph.type);
    property("article:published_time", openGraph.publishedTime);
    property("article:modified_time", openGraph.modifiedTime);
    // Every social card is 1200x630. Always emit size and alt so a page's
    // image never keeps the layout's (nested heads merge tag by tag).
    for (const image of openGraph.images ?? []) {
      const { url, width = 1200, height = 630, alt = openGraph.title } =
        typeof image === "string" ? ({ url: image } as OgImage) : image;
      property("og:image", absoluteUrl(url));
      property("og:image:width", width.toString());
      property("og:image:height", height.toString());
      property("og:image:alt", alt);
    }
  }

  if (twitter) {
    named("twitter:card", twitter.card);
    named("twitter:title", twitter.title);
    named("twitter:description", twitter.description);
    for (const image of twitter.images ?? []) {
      const { url, alt } = typeof image === "string" ? { url: image, alt: undefined } : image;
      named("twitter:image", absoluteUrl(url));
      named("twitter:image:alt", alt);
    }
  }

  for (const [name, value] of Object.entries(metadata.other ?? {})) {
    for (const content of Array.isArray(value) ? value : [value]) named(name, content);
  }

  return { meta, links };
}
