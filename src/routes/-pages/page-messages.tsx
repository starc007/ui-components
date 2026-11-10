import type { ReactNode } from "react";
import { IntlProvider, useMessages } from "use-intl";
import { LOCALE, type SiteMessages } from "@/i18n/messages";

type PageKey = keyof SiteMessages["Pages"];

/**
 * Docs page prose is not in the client messages. A page's static server
 * function returns its `Pages.<page>` subtree and this provider merges it in,
 * so the page renders it with `useTranslations` and `t.rich` like before.
 */
export function PageMessages<Page extends PageKey>({
  page,
  messages,
  children,
}: {
  page: Page;
  messages: SiteMessages["Pages"][Page];
  children: ReactNode;
}) {
  const base = useMessages();
  return (
    <IntlProvider
      locale={LOCALE}
      messages={{ ...base, Pages: { ...base.Pages, [page]: messages } }}
      timeZone="UTC"
    >
      {children}
    </IntlProvider>
  );
}
