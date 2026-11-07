import { categoryPath, nativeComponentPath } from "@/lib/component-paths";
import { isComponentNew } from "@/lib/component-status";
import { native } from "@/lib/native";
import summary from "@/lib/native/summary.json";
import { type ComponentEntry, INSTALLABLE_COUNT, registry } from "@/lib/registry";
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
export function resolveEntries(keys: readonly string[]): LandingEntry[] {
  return keys.flatMap((key) => {
    const [category, slug] = key.split("/");
    const component = registry
      .find((entry) => entry.slug === category)
      ?.components.find((entry) => entry.slug === slug);
    return component ? [{ category, component: toTile(component) }] : [];
  });
}

function variantCount(component: ComponentEntry) {
  return (component.examples ?? []).filter((example) => example.installSlug).length || 1;
}

const CATEGORY_ORDER = ["motion", "blocks", "agents", "charts", "casino"] as const;

const CATEGORY_BLURBS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  motion: "Buttons, menus, inputs, overlays and text effects.",
  blocks: "Composed widgets ready to drop into a product.",
  agents: "Chat, streaming, approvals and tool output.",
  charts: "Line, bar, sankey, treemap and trading charts.",
  casino: "Crash, mines and plinko with fair odds.",
};

/** Each library section with its install count, variants included. */
export const CATEGORIES = CATEGORY_ORDER.flatMap((slug) => {
  const category = registry.find((entry) => entry.slug === slug);
  if (!category) return [];
  return [
    {
      slug,
      name: category.name,
      blurb: CATEGORY_BLURBS[slug],
      href: categoryPath(slug),
      count: category.components.reduce((n, c) => n + variantCount(c), 0),
      entries: category.components.map((component) => ({
        category: slug,
        component: toTile(component),
      })),
    },
  ];
});

/** Components still marked new, newest first, named after their newest variant. */
export const NEW_ENTRIES: (LandingEntry & { previewKey?: string })[] = registry
  .flatMap((category) =>
    category.components.filter((c) => isComponentNew(c)).map((component) => {
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
  .sort((a, b) =>
    (b.component.launchedAt ?? "").localeCompare(a.component.launchedAt ?? ""),
  );

export const WEB_COUNT = INSTALLABLE_COUNT;
export const NATIVE_COUNT = summary.variants;

/** Native components whose clips show the most in a few seconds. */
export function nativePhones(slugs: readonly string[]) {
  return slugs.flatMap((slug) => {
    const component = native.components.find((c) => c.slug === slug);
    return component
      ? [{ slug, title: component.title, href: nativeComponentPath(slug), clips: component.clips }]
      : [];
  });
}

export const PRO_URL = (content: string) =>
  `https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=${content}`;

export const SPONSORS = [
  { name: "Tracwell", domain: "tracwell.app", icon: "tracwell-icon" },
  { name: "Illos", domain: "illos.dev", icon: "illos-icon" },
];
