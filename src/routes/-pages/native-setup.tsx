import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { CopyPage } from "@/components/app/docs/copy-page";
import { GuideShell } from "@/components/app/docs/guide-shell";
import { messages } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import type { Metadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { native } from "@/lib/native";
import {
  BABEL_SNIPPET,
  CLI_SNIPPET,
  CSS_TYPES_SNIPPET,
  GLOBAL_CSS_SNIPPET,
  INSTALL_SNIPPET,
  LAYOUT_SNIPPET,
  LAYOUT_TREE,
  METRO_BARE_SNIPPET,
  METRO_EXPO_SNIPPET,
  NATIVE_VERSIONS,
  NATIVE_SETUP_PATH as PAGE_PATH,
  SOURCE_SNIPPET,
  USAGE_SNIPPET,
} from "@/lib/native-setup";
import { Link } from "@/lib/navigation";
import { ogImagePath } from "@/lib/og-paths";
import { breadcrumbJsonLd, docsArticleJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { PageMessages } from "./page-messages";

const PAGE_IMAGE = ogImagePath("page", "native-setup");

export const getNativeSetupPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.nativeSetup");
    const title = t("meta.title");
    const description = t("meta.description");
    const metadata: Metadata = {
      title,
      description,
      alternates: {
        canonical: PAGE_PATH,
        types: { "text/markdown": `${PAGE_PATH}.md` },
      },
      openGraph: {
        title: `${title} · beUI`,
        description,
        url: PAGE_PATH,
        locale: "en_US",
        type: "article",
        siteName: "beUI",
        images: [{ url: PAGE_IMAGE, width: 1200, height: 630, alt: t("meta.imageAlt") }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · beUI`,
        description,
        images: [PAGE_IMAGE],
      },
    };

    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: t("breadcrumb.home"), path: "/" },
        { name: t("breadcrumb.page"), path: PAGE_PATH },
      ]),
      docsArticleJsonLd({
        path: PAGE_PATH,
        headline: title,
        description,
        image: PAGE_IMAGE,
        datePublished: "2026-10-16",
        dateModified: "2026-10-16",
        about: ["React Native", "Expo", "Uniwind", "Reanimated", "beUI Native"],
      }),
    ];

    const [
      install,
      babel,
      globalCss,
      metroExpo,
      metroBare,
      cssTypes,
      theme,
      layout,
      cli,
      tree,
      usage,
      source,
    ] = await Promise.all([
      highlight(INSTALL_SNIPPET, { lang: "bash", filename: "terminal" }),
      highlight(BABEL_SNIPPET, { lang: "js", filename: "babel.config.js" }),
      highlight(GLOBAL_CSS_SNIPPET, { lang: "css", filename: "global.css" }),
      highlight(METRO_EXPO_SNIPPET, { lang: "js", filename: "metro.config.js" }),
      highlight(METRO_BARE_SNIPPET, { lang: "js", filename: "metro.config.js" }),
      highlight(CSS_TYPES_SNIPPET, { lang: "ts", filename: "src/env.d.ts" }),
      highlight(native.theme.content, { lang: "css", filename: native.theme.path }),
      highlight(LAYOUT_SNIPPET, { lang: "tsx", filename: "app/_layout.tsx" }),
      highlight(CLI_SNIPPET, { lang: "bash", filename: "terminal" }),
      highlight(LAYOUT_TREE, { lang: "text", filename: t("addComponent.treeLabel") }),
      highlight(USAGE_SNIPPET, { lang: "tsx", filename: "app/index.tsx" }),
      highlight(SOURCE_SNIPPET, { lang: "css", filename: "app/global.css" }),
    ]);

    return {
      metadata,
      jsonLd,
      messages: messages.Pages.nativeSetup,
      themePath: native.theme.path,
      repository: native.repository,
      code: {
        install,
        babel,
        globalCss,
        metroExpo,
        metroBare,
        cssTypes,
        theme,
        layout,
        cli,
        tree,
        usage,
        source,
      },
    };
  });

export type NativeSetupPageData = Awaited<ReturnType<typeof getNativeSetupPage>>;

const link =
  "text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground";

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-xl font-medium tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>;
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{children}</p>;
}

const code = (chunks: ReactNode) => <Code>{chunks}</Code>;

function external(href: string) {
  return (chunks: ReactNode) => (
    <a href={href} target="_blank" rel="noreferrer noopener" className={link}>
      {chunks}
    </a>
  );
}

function internal(href: string) {
  return (chunks: ReactNode) => (
    <Link href={href} className={link}>
      {chunks}
    </Link>
  );
}

export function NativeSetupPage({ data }: { data: NativeSetupPageData }) {
  return (
    <PageMessages page="nativeSetup" messages={data.messages}>
      <NativeSetupContent data={data} />
    </PageMessages>
  );
}

function NativeSetupContent({ data }: { data: NativeSetupPageData }) {
  const t = useTranslations("Pages.nativeSetup");
  const blocks = data.code;

  return (
    <GuideShell>
      <JsonLd data={data.jsonLd} />
      <header id="overview" className="scroll-mt-24">
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
            componentName="React Native Setup"
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("header.intro")}</p>
      </header>

      <Section id="requirements" title={t("requirements.title")}>
        <Prose>{t("requirements.body")}</Prose>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {NATIVE_VERSIONS.map((row) => (
            <li key={row.library} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <a href={row.url} target="_blank" rel="noreferrer noopener" className={link}>
                {row.library}
              </a>
              <span className="text-muted-foreground">{row.version}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="install" title={t("install.title")}>
        <Prose>{t.rich("install.body", { code })}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.install} />
        </div>
        <Note>{t.rich("install.babelNote", { code })}</Note>
        <div className="mt-4">
          <CodeBlock {...blocks.babel} />
        </div>
      </Section>

      <Section id="uniwind" title={t("uniwind.title")}>
        <Prose>
          {t.rich("uniwind.body", { code, link: external("https://docs.uniwind.dev") })}
        </Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.globalCss} />
        </div>
        <Prose>{t.rich("uniwind.metro", { code })}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.metroExpo} />
        </div>
        <Note>{t.rich("uniwind.bareNote", { code })}</Note>
        <div className="mt-4">
          <CodeBlock {...blocks.metroBare} />
        </div>
        <Note>{t.rich("uniwind.typesNote", { code })}</Note>
        <div className="mt-4">
          <CodeBlock {...blocks.cssTypes} />
        </div>
      </Section>

      <Section id="theme" title={t("theme.title")}>
        <Prose>{t.rich("theme.body", { code, path: data.themePath })}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.theme} />
        </div>
      </Section>

      <Section id="root" title={t("root.title")}>
        <Prose>{t.rich("root.body", { code })}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.layout} />
        </div>
        <Note>
          {t.rich("root.bareNote", {
            code,
            link: external("https://docs.expo.dev/versions/v57.0.0/sdk/keyboard-controller/"),
          })}
        </Note>
      </Section>

      <Section id="add-component" title={t("addComponent.title")}>
        <Prose>{t.rich("addComponent.cli", { code })}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.cli} />
        </div>
        <Prose>{t.rich("addComponent.manual", { link: internal("/react-native") })}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.tree} />
        </div>
        <Prose>{t("addComponent.usage")}</Prose>
        <div className="mt-4">
          <CodeBlock {...blocks.usage} />
        </div>
        <Note>{t.rich("addComponent.sourceNote", { code })}</Note>
        <div className="mt-4">
          <CodeBlock {...blocks.source} />
        </div>
      </Section>

      <Section id="try-first" title={t("tryFirst.title")}>
        <Prose>
          {t.rich("tryFirst.body", {
            code,
            url: `${SITE_URL}/native/r`,
            componentsLink: internal("/react-native"),
            agentLink: internal("/docs/ai-agents"),
          })}
        </Prose>
        <Note>{t.rich("tryFirst.note", { code, link: external(data.repository) })}</Note>
      </Section>
    </GuideShell>
  );
}
