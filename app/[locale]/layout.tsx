import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { localeAlternates } from "@/i18n/metadata";
import { LANGUAGES, routing } from "@/i18n/routing";
import { LocaleProvider } from "@/lib/i18n";
import { GoogleAnalytics } from "@/components/app/analytics/google-analytics";
import { ThemeProvider } from "@/components/app/chrome/theme-provider";
import { SiteHeader } from "@/components/app/chrome/site-header";
import { NativeStrip } from "@/components/app/chrome/native-strip";
import { SiteFrame } from "@/components/app/chrome/site-frame";
import { KeyboardShortcuts } from "@/components/app/chrome/keyboard-shortcuts";
import { JsonLd } from "@/components/app/analytics/json-ld";
import {
  AUTHOR,
  SITE_NAME,
  siteJsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutProps = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("siteTitle");
  const description = t("siteDescription");
  return {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${title} · beUI`,
    template: "%s · beUI",
  },
  description,
  authors: [{ name: AUTHOR, url: "https://github.com/starc007" }],
  creator: AUTHOR,
  publisher: SITE_NAME,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  alternates: {
    ...localeAlternates("/", locale),
    types: {
      "application/json": "/registry.json",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    title: `${title} · beUI`,
    description,
    type: "website",
    url: localeAlternates("/", locale).canonical,
    siteName: SITE_NAME,
    locale: LANGUAGES[locale].og,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: `${title} · beUI`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · beUI`,
    description,
    images: ["/api/og"],
  },
  keywords: [
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
  ],
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Guides are long and only rendered on the server; keep them out of the client payload.
  const { Guides: _serverOnlyGuides, ...clientMessages } = await getMessages();
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(sans.variable, mono.variable)}
    >
      <head>
        {process.env.NODE_ENV === "production" && (
          <script
            defer
            src="https://collect.tracwell.app/script.js"
            data-project-key="tw_live_b83ebcb2a50b4e3b82f65ca32c086623"
            data-collection-mode="product"
            data-consent="granted"
            data-respect-do-not-track="true"
          />
        )}
        <link rel="icon" type="image/png" href="/beui-mark.png" />
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
        <link rel="alternate" type="application/json" title="Component registry" href="/r" />
        <link rel="alternate" type="application/json" title="shadcn registry" href="/registry.json" />
      </head>
      <body className="min-h-screen antialiased">
        <JsonLd data={siteJsonLd()} />
        <NextIntlClientProvider messages={clientMessages}>
        <LocaleProvider locale={locale} messages={clientMessages.Components}>
        <ThemeProvider>
          <KeyboardShortcuts />
          <NativeStrip />
          <SiteHeader />
          <main>
            <SiteFrame>{children}</SiteFrame>
          </main>
          <GoogleAnalytics measurementId={googleAnalyticsId} />
        </ThemeProvider>
        </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
