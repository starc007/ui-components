import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { CodeBlock } from "@/components/app/docs/code-block";
import { AnchorHeading } from "@/components/app/docs/heading-anchor";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import { pageMetadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { Link } from "@/lib/navigation";
import { THEME_CSS } from "@/lib/theme-css";
import { PageMessages } from "./page-messages";

const PAGE_PATH = "/docs/theme";

const SHADCN_INIT = `npx shadcn@latest add https://beui.dev/r/theme.json`;

const H2_CLASS = "text-xl font-medium tracking-tight text-foreground";

export const getThemePage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.theme.meta");
    const metadata = pageMetadata({
      path: PAGE_PATH,
      title: t("title"),
      description: t("description"),
      ogDescription: t("ogDescription"),
      type: "article",
      types: { "text/markdown": `${PAGE_PATH}.md` },
    });
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
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t("eyebrow")}
      </p>
      <AnchorHeading
        as="h1"
        className="mt-2"
        headingClassName="text-3xl font-medium tracking-tight text-foreground"
      >
        {t("title")}
      </AnchorHeading>
      <p className="mt-3 text-muted-foreground">{t.rich("intro", { code })}</p>

      <AnchorHeading id="shadcn-init" className="mt-10" headingClassName={H2_CLASS}>
        {t("option1.title")}
      </AnchorHeading>
      <p className="mt-2 text-muted-foreground">{t("option1.body")}</p>
      <div className="mt-4">
        <CodeBlock {...data.code.shadcnInit} />
      </div>

      <AnchorHeading id="theme-css" className="mt-10" headingClassName={H2_CLASS}>
        {t("option2.title")}
      </AnchorHeading>
      <p className="mt-2 text-muted-foreground">
        {t.rich("option2.body", { code })}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.rich("option2.alsoAvailable", {
          // A static file, not a page, so a plain anchor.
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

      <AnchorHeading id="customize" className="mt-10" headingClassName={H2_CLASS}>
        {t("customize.title")}
      </AnchorHeading>
      <p className="mt-2 text-muted-foreground">
        {t.rich("customize.body", {
          link: (chunks) => (
            <Link href="/themes" className="text-foreground underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
