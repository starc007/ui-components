import { createFormatter, createTranslator, type NamespaceKeys, type NestedKeyOf } from "use-intl/core";
import { loadMessages, type SiteMessages } from "./messages";
import type { Locale } from "./routing";

/**
 * Build-time translation for static server functions, with next-intl's
 * explicit-locale signatures. Components use `useTranslations` from use-intl.
 */
export function getMessages({ locale }: { locale: Locale }) {
  return loadMessages(locale);
}

export async function getTranslations<
  Namespace extends NamespaceKeys<SiteMessages, NestedKeyOf<SiteMessages>> = never,
>({ locale, namespace }: { locale: Locale; namespace?: Namespace }) {
  const messages = await loadMessages(locale);
  return createTranslator({ locale, messages, namespace });
}

export function getFormatter({ locale }: { locale: Locale }) {
  return createFormatter({ locale });
}

/**
 * The messages client components read. Guide and docs prose and search
 * copy stay in the server functions that render those pages.
 */
export function clientMessages(messages: SiteMessages) {
  const { Guides: _guides, Pages, Catalog, ...shared } = messages;
  return {
    ...shared,
    Pages: {
      motionPatterns: Pages.motionPatterns,
      playground: Pages.playground,
      sponsors: Pages.sponsors,
    },
    Catalog: {
      categories: Catalog.categories,
      components: Object.fromEntries(
        Object.entries(Catalog.components).map(([slug, { seo: _seo, ...text }]) => [slug, text]),
      ),
    },
  };
}

export type ClientMessages = ReturnType<typeof clientMessages>;
