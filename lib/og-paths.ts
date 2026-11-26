/**
 * Social cards are PNGs rendered once at build time by scripts/build-static.ts
 * (see lib/og-cards.tsx for the list). Pages link the static file.
 */
export type OgCardKind =
  | "component"
  | "variant"
  | "category"
  | "native"
  | "page"
  | "guide"
  | "alternative"
  | "blog";

export const DEFAULT_OG_IMAGE = "/og/cards/default.png";

/**
 * A blog post's wide cover (2000x840): the top of the post page and the cover
 * on dev.to and Medium. Its social card is `ogImagePath("blog", slug)`. Both
 * come from lib/blog-banner.tsx.
 */
export function blogCoverPath(slug: string) {
  return `/og/cards/blog/${slug}-cover.png`;
}

export function ogImagePath(kind?: OgCardKind, slug?: string) {
  return kind && slug ? `/og/cards/${kind}/${slug}.png` : DEFAULT_OG_IMAGE;
}
