import { agentGuides } from "@/lib/agent-guides";
import { type ComponentSeo, componentSeo } from "@/lib/component-seo";
import { registry } from "@/lib/registry";

type Text = { name: string; description?: string };

/**
 * English catalog and guide messages, read straight from lib/registry.ts and
 * lib/agent-guides.ts so there is one source of truth. Translations in
 * messages/<locale>/catalog.json and guides.json use the same shape.
 * `seo` is the search title/description from lib/component-seo.ts.
 * Code trees and slugs are left out: they are never translated.
 */
export const englishCatalog = {
  categories: Object.fromEntries(
    registry.map((category) => [category.slug, { name: category.name, description: category.description }]),
  ) as Record<string, Text>,
  components: Object.fromEntries(
    registry.flatMap((category) => category.components).map((component) => [
      component.slug,
      {
        name: component.name,
        description: component.description,
        ...(componentSeo[component.slug] ? { seo: componentSeo[component.slug] } : {}),
        ...(component.examples?.length
          ? {
              examples: Object.fromEntries(
                component.examples.map((example) => [
                  example.slug,
                  { name: example.name, ...(example.description ? { description: example.description } : {}) },
                ]),
              ),
            }
          : {}),
      },
    ]),
  ) as Record<string, Text & { seo?: ComponentSeo; examples?: Record<string, Text> }>,
};

export const englishGuides = Object.fromEntries(
  Object.entries(agentGuides).map(([slug, guide]) => [
    slug,
    {
      seo: guide.seo,
      introduction: guide.introduction,
      composition: { description: guide.composition.description },
      lifecycle: guide.lifecycle,
      principles: guide.principles,
      implementation: guide.implementation,
      connections: guide.connections.map(({ name, description }) => ({ name, description })),
      contract: guide.contract,
      guidance: guide.guidance,
    },
  ]),
);
