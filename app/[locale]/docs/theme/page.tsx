import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/app/docs/code-block";
import { localeAlternates } from "@/i18n/metadata";
import { LANGUAGES, routing } from "@/i18n/routing";
import { THEME_CSS } from "@/lib/theme-css";

const PAGE_PATH = "/docs/theme";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Pages.theme.meta" });
  const alternates = localeAlternates(PAGE_PATH, locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates,
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

const SHADCN_INIT = `npx shadcn@latest init`;

const code = (chunks: ReactNode) => (
  <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
    {chunks}
  </code>
);

export default async function ThemePage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Pages.theme");

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t.rich("intro", { code })}</p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        {t("option1.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">{t("option1.body")}</p>
      <div className="mt-4">
        <CodeBlock code={SHADCN_INIT} lang="bash" filename="terminal" />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
        {t("option2.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {t.rich("option2.body", { code })}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.rich("option2.alsoAvailable", {
          // A static file, not a page: keep one unprefixed URL.
          link: (chunks) => (
            <a
              href="/theme.css"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
            >
              {chunks}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          ),
        })}
      </p>
      <div className="mt-4">
        <CodeBlock code={THEME_CSS} lang="css" filename="globals.css" />
      </div>
    </div>
  );
}
