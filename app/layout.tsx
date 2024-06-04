import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/appComp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "beUi - build better, built faster",
  description: "Build your website 10X faster with free ui components",
  openGraph: {
    title: "beUi - build better, built faster",
    description: "Build your website 10X faster with free ui components",
    type: "website",
    url: "https://beui.xyz",
    images: ["/og.png"],
  },
  keywords: [
    "Free UI Components",
    "React UI Components",
    "React Components",
    "Tailwind CSS Components",
    "Tailwind CSS",
    "React",
    "UI Components",
    "beUi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <Analytics />
        <Navbar />
        <main className="container mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
