import type { AgentGuide } from "@/lib/agent-guides";
import type { CategoryEntry, ComponentEntry } from "@/lib/registry";
import { mergeMessages } from "./merge";
import type { SiteMessages } from "./messages";

/**
 * Registry and guide text stays English in lib/registry.ts and
 * lib/agent-guides.ts; these swap in translated names, descriptions and guide
 * copy. Get the messages from `useMessages()` (client) or `getMessages()` (server).
 * Slugs, files, code trees and install commands never change.
 */
type CatalogText = { name: string; description?: string };
type ComponentText = CatalogText & { examples?: Record<string, CatalogText> };

function catalogOf(messages: Pick<SiteMessages, "Catalog">) {
  return messages.Catalog as unknown as {
    categories: Record<string, CatalogText>;
    components: Record<string, ComponentText>;
  };
}

export function localizeComponent<T extends ComponentEntry>(
  component: T,
  messages: Pick<SiteMessages, "Catalog">,
): T {
  const text = catalogOf(messages).components[component.slug];
  if (!text) return component;
  return {
    ...component,
    name: text.name,
    description: text.description ?? component.description,
    examples: component.examples?.map((example) => {
      const exampleText = text.examples?.[example.slug];
      return exampleText
        ? { ...example, name: exampleText.name, description: exampleText.description ?? example.description }
        : example;
    }),
  };
}

export function localizeCategory<T extends CategoryEntry>(
  category: T,
  messages: Pick<SiteMessages, "Catalog">,
): T {
  const text = catalogOf(messages).categories[category.slug];
  return {
    ...category,
    name: text?.name ?? category.name,
    description: text?.description ?? category.description,
    components: category.components.map((component) => localizeComponent(component, messages)),
  };
}

export function localizeGuide(
  slug: string,
  guide: AgentGuide,
  messages: Pick<SiteMessages, "Guides">,
): AgentGuide {
  const text = (messages.Guides as Record<string, unknown>)[slug];
  return text ? mergeMessages(guide, text) : guide;
}
