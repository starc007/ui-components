import type { Metadata } from "next";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { ChangelogContent } from "@/components/app/changelog/changelog-content";
import { CHANGELOG_DESCRIPTION, CHANGELOG_FEED_PATH, CHANGELOG_PATH } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: CHANGELOG_DESCRIPTION,
  alternates: {
    canonical: CHANGELOG_PATH,
    types: { "application/rss+xml": CHANGELOG_FEED_PATH },
  },
  openGraph: {
    title: "Changelog · beUI",
    description: CHANGELOG_DESCRIPTION,
    url: CHANGELOG_PATH,
    type: "website",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog · beUI",
    images: ["/api/og"],
  },
};

export default function ChangelogPage() {
  return (
    <>
      <ChangelogContent />
      <SiteFooter />
    </>
  );
}
