import { categoryPath } from "@/lib/component-paths";
import { isComponentNew } from "@/lib/component-status";
import summary from "@/lib/native/summary.json";
import { type CategoryEntry, type ComponentEntry, INSTALLABLE_COUNT } from "@/lib/registry";
import type { TileComponent } from "./preview-tile";

export type LandingEntry = { category: string; component: TileComponent };

/** Strips a registry entry down to what a client tile needs. */
export function toTile(component: ComponentEntry): TileComponent {
  return {
    slug: component.slug,
    name: component.name,
    badge: component.badge,
    launchedAt: component.launchedAt,
    examples: component.examples?.slice(0, 1).map(({ previewKey }) => ({ previewKey })),
    installSlug: component.examples?.find((example) => example.installSlug)?.installSlug ?? component.slug,
  };
}

/** Resolves `category/slug` keys to registry entries, dropping unknown ones. */
export function resolveEntries(source: CategoryEntry[], keys: readonly string[]): LandingEntry[] {
  return keys.flatMap((key) => {
    const [category, slug] = key.split("/");
    const component = source
      .find((entry) => entry.slug === category)
      ?.components.find((entry) => entry.slug === slug);
    return component ? [{ category, component: toTile(component) }] : [];
  });
}

const CATEGORY_ORDER = ["motion", "blocks", "agents", "charts", "casino"] as const;

/**
 * Each library section with its number of component pages, matching what its
 * page and the footer list (Casino is three games, not five designs).
 */
export function landingCategories(source: CategoryEntry[]) {
  return CATEGORY_ORDER.flatMap((slug) => {
    const category = source.find((entry) => entry.slug === slug);
    if (!category) return [];
    return [
      {
        slug,
        name: category.name,
        href: categoryPath(slug),
        count: category.components.length,
        entries: category.components.map((component) => ({
          category: slug,
          component: toTile(component),
        })),
      },
    ];
  });
}

/** Components still marked new, newest first, named after their newest variant. */
export function newEntries(source: CategoryEntry[]): (LandingEntry & { previewKey?: string })[] {
  return source
    .flatMap((category) =>
      category.components
        .filter((c) => isComponentNew(c))
        .map((component) => {
          const variant = component.examples
            ?.filter((e) => isComponentNew(e))
            .sort((a, b) => (b.launchedAt ?? "").localeCompare(a.launchedAt ?? ""))[0];
          return {
            category: category.slug,
            previewKey: variant?.previewKey,
            component: toTile(
              variant ? { ...component, name: variant.name, launchedAt: variant.launchedAt } : component,
            ),
          };
        }),
    )
    .sort((a, b) => (b.component.launchedAt ?? "").localeCompare(a.component.launchedAt ?? ""));
}

export const WEB_COUNT = INSTALLABLE_COUNT;
export const NATIVE_COUNT = summary.variants;

export const PRO_URL = (content: string) =>
  `https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=${content}`;

export const SPONSORS = [
  { name: "Tracwell", domain: "tracwell.app", icon: "tracwell-icon" },
  { name: "Illos", domain: "illos.dev", icon: "illos-icon" },
];
