import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { CodeBlock } from "@/components/app/docs/code-block";
import { localeAlternates } from "@/i18n/metadata";
import { LANGUAGES, type Locale } from "@/i18n/routing";
import { getMessages, getTranslations } from "@/i18n/server";
import type { Metadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";
import { THEME_CSS } from "@/lib/theme-css";
import { PageMessages } from "./page-messages";

const PAGE_PATH = "/docs/theme";

const SHADCN_INIT = `npx shadcn@latest init`;

export const getThemePage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((locale: Locale) => locale)
  .handler(async ({ data: locale }) => {
    const [messages, t] = await Promise.all([
      getMessages({ locale }),
      getTranslations({ locale, namespace: "Pages.theme.meta" }),
    ]);
    const alternates = localeAlternates(PAGE_PATH, locale);
    const metadata: Metadata = {
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
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: `${t("title")} · beUI`,
        images: [DEFAULT_OG_IMAGE],
      },
    };
    const [shadcnInit, themeCss] = await Promise.all([
      highlight(SHADCN_INIT, { lang: "bash", filename: "terminal" }),
      highlight(THEME_CSS, { lang: "css", filename: "globals.css" }),
    ]);
    return { metadata, messages: messages.Pages.theme, code: { shadcnInit, themeCss } };
  });

export type ThemePageData = Awaited<ReturnType<typeof getThemePage>>;

const code = (chunks: ReactNode) => (
  <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
    {chunks}
  </code>
);

export function ThemePage({ data }: { data: ThemePageData }) {
  return (
    <PageMessages page="theme" messages={data.messages}>
      <ThemeContent data={data} />
    </PageMessages>
  );
}

function ThemeContent({ data }: { data: ThemePageData }) {
  const t = useTranslations("Pages.theme");

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
        <CodeBlock {...data.code.shadcnInit} />
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
        <CodeBlock {...data.code.themeCss} />
      </div>
    </div>
  );
}
