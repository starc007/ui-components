import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/app/theme-provider";
import { SiteHeader } from "@/components/app/site-header";
import { SiteDock } from "@/components/app/site-dock";
import { SiteFrame } from "@/components/app/site-frame";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "beUI v2 · bespoke motion components for React",
  description: "A curated motion library built with React, Tailwind v4 and motion. No Radix, no shadcn. Just craft.",
  openGraph: {
    title: "beUI v2",
    description: "Bespoke motion components for React.",
    type: "website",
    url: "https://beui.saura3h.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "beUI v2",
    description: "Bespoke motion components for React.",
  },
  keywords: ["React", "Tailwind", "Motion", "UI", "Components", "Open source"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, mono.variable)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
        <link rel="alternate" type="application/json" title="Component registry" href="/r" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <SiteHeader />
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
