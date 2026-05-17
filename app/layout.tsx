import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/app/theme-provider";
import { SiteHeader } from "@/components/app/site-header";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "beUI v2 — modern React + Tailwind components",
  description: "Open-source copy-paste UI components for React. Built with Tailwind v4, motion, and craft.",
  openGraph: {
    title: "beUI v2",
    description: "Open-source copy-paste UI components for React.",
    type: "website",
    url: "https://beui.xyz",
    images: ["/og.png"],
  },
  keywords: ["React", "Tailwind", "UI components", "Next.js", "Motion", "Open source"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, mono.variable, "font-sans", geist.variable)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main>{children}</main>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
