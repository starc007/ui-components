import { isComponentNew } from "@/lib/component-status";
import summary from "@/lib/native/summary.json";
import { type CategoryEntry, type ComponentEntry, INSTALLABLE_COUNT } from "@/lib/registry";

/** The registry fields the landing reads for a component, small enough for the client. */
export type LandingComponent = Pick<ComponentEntry, "slug" | "name" | "badge" | "launchedAt"> & {
  examples?: { previewKey: string }[];
};

export type LandingEntry = { category: string; component: LandingComponent };

function toLanding(component: ComponentEntry): LandingComponent {
  return {
    slug: component.slug,
    name: component.name,
    badge: component.badge,
    launchedAt: component.launchedAt,
    examples: component.examples?.slice(0, 1).map(({ previewKey }) => ({ previewKey })),
  };
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
            component: toLanding(
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
