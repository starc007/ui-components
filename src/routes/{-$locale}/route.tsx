import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { ReactNode } from "react";
import { IntlProvider } from "use-intl";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { GoogleAnalytics } from "@/components/app/analytics/google-analytics";
import { KeyboardShortcuts } from "@/components/app/chrome/keyboard-shortcuts";
import { NativeStrip } from "@/components/app/chrome/native-strip";
import { SiteFrame } from "@/components/app/chrome/site-frame";
import { SiteHeader } from "@/components/app/chrome/site-header";
import { ThemeProvider } from "@/components/app/chrome/theme-provider";
import { localeAlternates } from "@/i18n/metadata";
import { LANGUAGES, type Locale, localeFromParam, routing } from "@/i18n/routing";
import { clientMessages, getMessages, getTranslations } from "@/i18n/server";
import { type Metadata, metadataToHead } from "@/lib/head";
import { LocaleProvider } from "@/lib/i18n";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";
import { AUTHOR, SITE_NAME, siteJsonLd } from "@/lib/seo";
import { NotFoundPage } from "../-not-found";

const KEYWORDS = [
  "React motion components",
  "best motion components",
  "free motion components",
  "open source motion components",
  "open source React components",
  "free React components",
  "Tailwind CSS components",
  "Next.js components",
  "shadcn registry",
  "shadcn-compatible components",
  "framer motion components",
  "best framer motion components",
  "framer motion templates",
  "framer motion components and templates",
  "animated UI components",
  "component library",
  "copy paste components",
  "free",
  "open source",
];

const getLayout = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((locale: Locale) => locale)
  .handler(async ({ data: locale }) => {
    const [messages, t] = await Promise.all([
      getMessages({ locale }),
      getTranslations({ locale, namespace: "Metadata" }),
    ]);
    const title = `${t("siteTitle")} · beUI`;
    const description = t("siteDescription");
    const metadata: Metadata = {
      title: { absolute: title },
      description,
      keywords: KEYWORDS,
      openGraph: {
        title,
        description,
        type: "website",
        url: localeAlternates("/", locale).canonical,
        siteName: SITE_NAME,
        locale: LANGUAGES[locale].og,
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
      other: { author: AUTHOR, creator: AUTHOR, publisher: SITE_NAME, category: "technology" },
    };
    return { locale, messages: clientMessages(messages), metadata };
  });

export const Route = createFileRoute("/{-$locale}")({
  // An unknown first segment ("/xyz") renders English; the child route then
  // reports not found inside this layout.
  loader: ({ params }) => getLayout({ data: localeFromParam(params.locale) ?? routing.defaultLocale }),
  head: ({ loaderData, matches }) => {
    if (!loaderData) return {};
    const head = metadataToHead(loaderData.metadata);
    // A child that threw notFound() gets the not-found title and noindex.
    if (matches.some((match) => match.status === "notFound")) {
      const notFound = loaderData.messages.Chrome.notFound;
      return {
        ...head,
        meta: [
          { title: `${notFound.title} · beUI` },
          { name: "description", content: notFound.description },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return head;
  },
  component: () => (
    <LocaleLayout>
      <Outlet />
    </LocaleLayout>
  ),
  // Rendered in place of the layout, so it needs the same providers and chrome.
  notFoundComponent: () => (
    <LocaleLayout>
      <NotFoundPage />
    </LocaleLayout>
  ),
});

const googleAnalyticsId = import.meta.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID as string | undefined;

function LocaleLayout({ children }: { children: ReactNode }) {
  const { locale, messages } = Route.useLoaderData();
  return (
    <IntlProvider locale={locale} messages={messages as never} timeZone="UTC">
      <LocaleProvider locale={locale} messages={messages.Components}>
        <ThemeProvider>
          <JsonLd data={siteJsonLd()} />
          <KeyboardShortcuts />
          <NativeStrip />
          <SiteHeader />
          <main>
            <SiteFrame>{children}</SiteFrame>
          </main>
          <GoogleAnalytics measurementId={googleAnalyticsId} />
        </ThemeProvider>
      </LocaleProvider>
    </IntlProvider>
  );
}
