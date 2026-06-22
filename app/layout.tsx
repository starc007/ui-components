import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";
import { GoogleAnalytics } from "@/components/app/google-analytics";
import { ThemeProvider } from "@/components/app/theme-provider";
import { SiteHeader } from "@/components/app/site-header";
import { SiteDock } from "@/components/app/site-dock";
import { SiteFrame } from "@/components/app/site-frame";
import { KeyboardShortcuts } from "@/components/app/keyboard-shortcuts";
import { JsonLd } from "@/components/app/json-ld";
import { getGithubStarCount } from "@/lib/github";
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, siteJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const pixel = GeistPixelSquare;

export const metadata: Metadata = {
  metadataBase: new URL("https://beui.dev"),
  applicationName: SITE_NAME,
  title: {
    default: "beUI · Production-ready motion components for React & Next.js",
    template: "%s · beUI",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: AUTHOR, url: "https://github.com/starc007" }],
  creator: AUTHOR,
  publisher: SITE_NAME,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    types: {
      "application/json": "/registry.json",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    title: "beUI · Production-ready motion components for React & Next.js",
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "beUI · Production-ready motion components for React & Next.js",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "beUI · Production-ready motion components for React & Next.js",
    description: SITE_DESCRIPTION,
    images: ["/api/og"],
  },
  keywords: [
    "React motion components",
    "Tailwind CSS components",
    "shadcn registry",
    "shadcn-compatible components",
    "framer motion components",
    "animated UI components",
    "component library",
    "copy paste components",
    "open source",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const githubStarCount = await getGithubStarCount();
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, mono.variable, pixel.variable)}>
      <head>
        <link rel="icon" type="image/png" href="/beui-mark.png" />
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
        <link rel="alternate" type="application/json" title="Component registry" href="/r" />
        <link rel="alternate" type="application/json" title="shadcn registry" href="/registry.json" />
      </head>
      <body className="min-h-screen antialiased">
        <JsonLd data={siteJsonLd()} />
        <ThemeProvider>
          <KeyboardShortcuts />
          <SiteHeader githubStarCount={githubStarCount} />
          <main className="pt-14 pb-32">
            <SiteFrame>{children}</SiteFrame>
          </main>
          <SiteDock />
          {process.env.NODE_ENV === "production" && <Analytics />}
          {process.env.NODE_ENV === "production" && <SpeedInsights />}
          <GoogleAnalytics measurementId={googleAnalyticsId} />
        </ThemeProvider>
      </body>
    </html>
  );
}
