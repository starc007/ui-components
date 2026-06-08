import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";
import { ThemeProvider } from "@/components/app/theme-provider";
import { SiteHeader } from "@/components/app/site-header";
import { SiteDock } from "@/components/app/site-dock";
import { SiteFrame } from "@/components/app/site-frame";
import { getGithubStarCount } from "@/lib/github";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const pixel = GeistPixelSquare;

export const metadata: Metadata = {
  metadataBase: new URL("https://beui.saura3h.xyz"),
  applicationName: "beUI v2",
  title: "beUI v2 · motion components",
  description: "Simple UI components with motion.",
  alternates: {
    canonical: "/",
    types: {
      "application/json": "/registry.json",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    title: "beUI v2",
    description: "Simple UI components with motion.",
    type: "website",
    url: "/",
    siteName: "beUI v2",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "beUI v2 UI components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "beUI v2",
    description: "Simple UI components with motion.",
    images: ["/api/og"],
  },
  keywords: ["Motion components", "UI components", "Component library", "Open source"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const githubStarCount = await getGithubStarCount();

  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, mono.variable, pixel.variable)}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
        <link rel="alternate" type="application/json" title="Component registry" href="/r" />
        <link rel="alternate" type="application/json" title="shadcn registry" href="/registry.json" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <SiteHeader githubStarCount={githubStarCount} />
          <main className="pt-14 pb-32">
            <SiteFrame>{children}</SiteFrame>
          </main>
          <SiteDock />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
