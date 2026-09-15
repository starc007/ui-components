import { componentPath } from "@/lib/component-paths";
import { registry } from "@/lib/registry";

export const componentSearchEntries = registry.flatMap((category) =>
  category.components.flatMap((component) => {
    const href = componentPath(category.slug, component.slug);
    const keywords = [component.slug, category.slug, component.description, ...(component.keywords ?? [])];
    return [
      {
        id: `${category.slug}-${component.slug}`,
        label: component.name,
        group: category.name,
        href,
        keywords: [...keywords, ...(component.examples ?? [])
          .filter((example) => example.name === component.name)
          .flatMap((example) => [example.slug, example.installSlug ?? ""])],
        badge: component.badge,
        launchedAt: component.launchedAt,
      },
      ...(component.examples ?? [])
        .filter((example) => example.name !== component.name)
        .map((example) => ({
          id: `${category.slug}-${component.slug}-${example.slug}`,
          label: example.name,
          group: category.name,
          href: `${href}#${example.slug}`,
          keywords: [component.name, ...keywords, example.slug, example.installSlug ?? "", example.description ?? ""],
          badge: example.badge,
          launchedAt: example.launchedAt,
        })),
    ];
  }),
);
