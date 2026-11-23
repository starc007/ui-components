import { componentPath } from "@/lib/component-paths";
import {
  allComponents,
  type ComponentEntry,
  type ComponentExample,
  findComponent,
} from "@/lib/registry";

/**
 * A page splits into one page per variant when its variants are separate
 * components: more than one, each with its own file and install slug (Button:
 * Base, Stateful, Magnetic, Metallic). The parent page becomes an overview.
 * Pages whose examples share one file (Checkbox, Tooltip) are demos of one
 * component and stay a single page.
 */
export function isSplitPage(comp: Pick<ComponentEntry, "examples">) {
  const examples = comp.examples ?? [];
  return (
    examples.length > 1 &&
    examples.every((example) => example.installSlug) &&
    new Set(examples.map((example) => example.file)).size === examples.length
  );
}

/** `/components/motion/button/metallic`, `/casino/crash/plane`. */
export function variantPath(category: string, componentSlug: string, variantSlug: string) {
  return `${componentPath(category, componentSlug)}/${variantSlug}`;
}

/** The variant and its parent, when the parent is a split page. */
export function findVariant(category: string, componentSlug: string, variantSlug: string) {
  const comp = findComponent(category, componentSlug);
  if (!comp || !isSplitPage(comp)) return null;
  const example = comp.examples?.find((candidate) => candidate.slug === variantSlug);
  return example ? { comp, example } : null;
}

export type VariantPageRef = {
  category: string;
  comp: ComponentEntry;
  example: ComponentExample & { installSlug: string };
};

/** Every variant page, in registry order. */
export function allVariantPages(): VariantPageRef[] {
  return allComponents()
    .filter(isSplitPage)
    .flatMap((comp) =>
      (comp.examples ?? []).map((example) => ({
        category: comp.category.slug,
        comp,
        example: example as ComponentExample & { installSlug: string },
      })),
    );
}

/**
 * The docs page an install slug belongs to: its variant page when its parent
 * is split, else the parent page.
 */
export function docsPathFor(category: string, pageSlug: string, installSlug: string) {
  const comp = findComponent(category, pageSlug);
  const example =
    comp && isSplitPage(comp)
      ? comp.examples?.find((candidate) => candidate.installSlug === installSlug)
      : undefined;
  return example ? variantPath(category, pageSlug, example.slug) : componentPath(category, pageSlug);
}
