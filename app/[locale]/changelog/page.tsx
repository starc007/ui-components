import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { ChangelogContent } from "@/components/app/changelog/changelog-content";
import { routing } from "@/i18n/routing";
import { CHANGELOG_FEED_PATH, CHANGELOG_PATH } from "@/lib/changelog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Native.changelog" });
  const description = t("description");
  return {
    title: t("title"),
    description,
    // Entries are English only: every locale points search engines at the English page.
    alternates: {
      canonical: CHANGELOG_PATH,
      types: { "application/rss+xml": CHANGELOG_FEED_PATH },
    },
    openGraph: {
      title: `${t("title")} · beUI`,
      description,
      url: CHANGELOG_PATH,
      type: "website",
      siteName: "beUI",
      images: ["/api/og"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("title")} · beUI`,
      images: ["/api/og"],
    },
  };
}

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <>
      <ChangelogContent />
      <SiteFooter />
    </>
  );
}
