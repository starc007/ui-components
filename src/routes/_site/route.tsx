import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { ReactNode } from "react";
import { IntlProvider } from "use-intl";
import { GoogleAnalytics } from "@/components/app/analytics/google-analytics";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { KeyboardShortcuts } from "@/components/app/chrome/keyboard-shortcuts";
import { NativeStrip } from "@/components/app/chrome/native-strip";
import { SiteFrame } from "@/components/app/chrome/site-frame";
import { SiteHeader } from "@/components/app/chrome/site-header";
import { ThemeProvider } from "@/components/app/chrome/theme-provider";
import { LOCALE } from "@/i18n/messages";
import { clientMessages, getTranslations } from "@/i18n/server";
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
  .handler(async () => {
    const t = getTranslations("Metadata");
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
        url: "/",
        siteName: SITE_NAME,
        locale: "en_US",
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
      other: { author: AUTHOR, creator: AUTHOR, publisher: SITE_NAME, category: "technology" },
    };
    return { messages: clientMessages(), metadata };
  });

/** The site shell: messages, providers and chrome around every page. */
export const Route = createFileRoute("/_site")({
  loader: () => getLayout(),
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
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  ),
  // Rendered in place of the layout, so it needs the same providers and chrome.
  notFoundComponent: () => (
    <SiteLayout>
      <NotFoundPage />
    </SiteLayout>
  ),
});

const googleAnalyticsId = import.meta.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID as string | undefined;

function SiteLayout({ children }: { children: ReactNode }) {
  const { messages } = Route.useLoaderData();
  return (
    <IntlProvider locale={LOCALE} messages={messages as never} timeZone="UTC">
      {/* Library components format numbers for this locale; their labels are English defaults. */}
      <LocaleProvider locale={LOCALE}>
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
