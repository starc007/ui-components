import type { ComponentFaq } from "@/lib/component-about";

/**
 * Search landing pages: comparison pages at /alternatives/<slug> and tutorials
 * at /guides/<slug>. Nothing in the site's navigation, search or catalog links
 * to them; the sitemap is how crawlers find them. They link out to component
 * pages through `components`.
 */
export type SeoPageSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
  code?: { code: string; lang: string; filename?: string };
};

export type SeoPage = {
  slug: string;
  /** <title> before the " · beUI" suffix. */
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: SeoPageSection[];
  faq: ComponentFaq[];
  /** Registry slugs rendered as component cards. */
  components: string[];
  publishedAt: string;
  updatedAt: string;
};

export type ComparisonRow = { label: string; beui: string; other: string };

export type AlternativePage = SeoPage & {
  competitor: string;
  competitorUrl: string;
  comparison: ComparisonRow[];
};

export type SeoPageKind = "alternatives" | "guides";
