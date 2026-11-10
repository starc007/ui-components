/**
 * Social cards are PNGs rendered once at build time by scripts/build-static.ts
 * (see lib/og-cards.ts for the list). Pages link the static file.
 */
export type OgCardKind = "component" | "category" | "native" | "page" | "guide" | "alternative";

export const DEFAULT_OG_IMAGE = "/og/cards/default.png";

export function ogImagePath(kind?: OgCardKind, slug?: string) {
  return kind && slug ? `/og/cards/${kind}/${slug}.png` : DEFAULT_OG_IMAGE;
}
