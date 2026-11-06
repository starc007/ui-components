import { localizeCategory } from "@/i18n/catalog";
import type { SiteMessages } from "@/i18n/messages";
import { componentPath } from "@/lib/component-paths";
import { registry } from "@/lib/registry";

/**
 * Search entries in the reader's language. English names and descriptions stay
 * in the keywords, so an English query finds a component on any locale.
 */
export function componentSearchEntries(messages: Pick<SiteMessages, "Catalog">) {
  return registry.flatMap((english) => {
    const category = localizeCategory(english, messages);
    return category.components.flatMap((component, index) => {
      const source = english.components[index];
      const href = componentPath(category.slug, component.slug);
      const keywords = [
        component.slug,
        category.slug,
        component.description,
        source.name,
        source.description,
        ...(component.keywords ?? []),
      ];
      return [
        {
          id: `${category.slug}-${component.slug}`,
          label: component.name,
          group: category.name,
          href,
          keywords: [...keywords, ...(source.examples ?? [])
            .filter((example) => example.name === source.name)
            .flatMap((example) => [example.slug, example.installSlug ?? ""])],
          badge: component.badge,
          launchedAt: component.launchedAt,
        },
        // localizeComponent keeps example order, so index i is the English example.
        ...(component.examples ?? []).flatMap((example, i) => {
          const sourceExample = source.examples?.[i];
          if (sourceExample?.name === source.name) return [];
          return [{
            id: `${category.slug}-${component.slug}-${example.slug}`,
            label: example.name,
            group: category.name,
            href: `${href}#${example.slug}`,
            keywords: [
              component.name,
              ...keywords,
              example.slug,
              example.installSlug ?? "",
              example.description ?? "",
              sourceExample?.name ?? "",
              sourceExample?.description ?? "",
            ],
            badge: example.badge,
            launchedAt: example.launchedAt,
          }];
        }),
      ];
    });
  });
}
