import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { localeAlternates } from "@/i18n/metadata";
import { LANGUAGES, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { MotionPatterns } from "./motion-patterns";

const PAGE_PATH = "/docs/motion-patterns";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({
    locale,
    namespace: "Pages.motionPatterns.meta",
  });
  const alternates = localeAlternates(PAGE_PATH, locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      ...alternates,
      types: { "text/markdown": `${PAGE_PATH}.md` },
    },
    openGraph: {
      title: `${t("title")} · beUI`,
      description: t("ogDescription"),
      url: alternates.canonical,
      locale: LANGUAGES[locale].og,
      type: "article",
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

export default async function MotionPatternsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Pages.motionPatterns");


  return (
    <GuideShell>
      <header
        id="overview"
        className="scroll-mt-24 border-b border-border pb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("header.eyebrow")}
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {t("header.title")}
          </h1>
          <CopyPage
            pageUrl={`${SITE_URL}${PAGE_PATH}`}
            markdownPath={`${PAGE_PATH}.md`}
            componentName="Motion Guides"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t("header.intro")}
        </p>
      </header>

      <MotionPatterns />
    </GuideShell>
  );
}
