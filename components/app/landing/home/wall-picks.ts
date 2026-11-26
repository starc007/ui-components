import { componentPath } from "@/lib/component-paths";
import type { CategoryEntry } from "@/lib/registry";
import { variantCopy } from "@/lib/variant-copy";
import { variantPath } from "@/lib/variant-pages";
import { newEntries } from "./landing-data";

/** How a tile is played with; the wall's filter chips. */
export const WALL_TAGS = ["hover", "press", "drag", "type", "loading", "sound"] as const;
export type WallTag = (typeof WALL_TAGS)[number];

type WallPick = {
  category: string;
  slug: string;
  /** A variant's example slug, for a page split into variant pages. */
  variant?: string;
  tags: WallTag[];
  /** Tile height in grid rows. */
  rows: 2 | 3;
  /** A small control (a button, a rating) shown larger in its tile. */
  small?: boolean;
};

/**
 * The landing wall: components that are fun to touch, each tagged by how you
 * play with it. Sound is only for components that make sound.
 */
const PICKS: WallPick[] = [
  { category: "motion", slug: "before-after-slider", tags: ["drag"], rows: 3 },
  { category: "motion", slug: "button", variant: "magnetic", tags: ["hover"], rows: 2, small: true },
  { category: "casino", slug: "crash", variant: "plane", tags: ["press", "sound"], rows: 3 },
  { category: "blocks", slug: "bloom-menu", tags: ["press"], rows: 3 },
  { category: "blocks", slug: "otp-input", tags: ["type"], rows: 2 },
  { category: "blocks", slug: "card-folder", tags: ["hover", "press"], rows: 2 },
  { category: "motion", slug: "wheel-picker", tags: ["drag", "sound"], rows: 3 },
  { category: "micro-interactions", slug: "like-button", tags: ["press", "sound"], rows: 2, small: true },
  { category: "motion", slug: "color-picker", tags: ["drag"], rows: 3 },
  { category: "micro-interactions", slug: "download-button", tags: ["press", "loading", "sound"], rows: 2, small: true },
  { category: "blocks", slug: "dynamic-island", tags: ["press", "loading"], rows: 2 },
  { category: "agents", slug: "prompt-input", tags: ["type", "loading"], rows: 2 },
  { category: "blocks", slug: "project-folder", tags: ["hover"], rows: 3 },
  { category: "motion", slug: "range-slider", variant: "wave", tags: ["drag", "sound"], rows: 2 },
  { category: "micro-interactions", slug: "send-button", tags: ["press", "loading", "sound"], rows: 2, small: true },
  { category: "casino", slug: "plinko", tags: ["press", "sound"], rows: 3 },
  { category: "micro-interactions", slug: "star-rating", tags: ["hover", "press", "sound"], rows: 2, small: true },
  { category: "motion", slug: "bookshelf", tags: ["press", "sound"], rows: 3 },
];

export type WallTile = {
  key: string;
  name: string;
  href: string;
  previewKey: string;
  isNew: boolean;
  launchedAt: string | null;
  tags: WallTag[];
  rows: 2 | 3;
  small: boolean;
};

/**
 * The wall's tiles: the newest launches first, so a just-shipped component
 * leads, then the picks.
 */
export function wallTiles(source: CategoryEntry[]): WallTile[] {
  const tiles: WallTile[] = [];
  const seen = new Set<string>();

  for (const entry of newEntries(source).slice(0, 2)) {
    const pick = PICKS.find(
      (candidate) => candidate.category === entry.category && candidate.slug === entry.component.slug,
    );
    const key = `${entry.category}/${entry.component.slug}`;
    seen.add(key);
    tiles.push({
      key,
      name: entry.component.name,
      href: componentPath(entry.category, entry.component.slug),
      previewKey:
        entry.previewKey ?? entry.component.examples?.[0]?.previewKey ?? `${entry.category}/${entry.component.slug}`,
      isNew: true,
      launchedAt: entry.component.launchedAt ?? null,
      tags: pick?.tags ?? [],
      rows: pick?.rows ?? 3,
      small: pick?.small ?? false,
    });
  }

  for (const pick of PICKS) {
    const key = `${pick.category}/${pick.slug}`;
    if (seen.has(key)) continue;
    const component = source
      .find((category) => category.slug === pick.category)
      ?.components.find((candidate) => candidate.slug === pick.slug);
    if (!component) continue;
    const example = pick.variant
      ? component.examples?.find((candidate) => candidate.slug === pick.variant)
      : undefined;
    const copy = example?.installSlug ? variantCopy[example.installSlug] : undefined;
    tiles.push({
      key,
      name: copy?.name ?? example?.name ?? component.name,
      href: example
        ? variantPath(pick.category, component.slug, example.slug)
        : componentPath(pick.category, component.slug),
      previewKey: example?.previewKey ?? `${pick.category}/${component.slug}`,
      isNew: false,
      launchedAt: null,
      tags: pick.tags,
      rows: pick.rows,
      small: pick.small ?? false,
    });
  }

  return tiles;
}
