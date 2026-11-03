import {
  categoryPath,
  componentPath,
  nativeComponentPath,
} from "@/lib/component-paths";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Smartphone } from "lucide-react";
import { hasLocale } from "next-intl";
import {
  getFormatter,
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import {
  localizeCategory,
  localizeComponent,
  localizeGuide,
} from "@/i18n/catalog";
import type { SiteMessages } from "@/i18n/messages";
import { localeAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { LANGUAGES, type Locale, localizedPath, routing } from "@/i18n/routing";
import {
  findCategory,
  findComponent,
  registry,
  type ComponentEntry,
  type ComponentExample,
} from "@/lib/registry";
import { CodeBlock } from "@/components/app/docs/code-block";
import { InstallBlock } from "@/components/app/docs/install-block";
import { KeepInMind } from "@/components/app/docs/keep-in-mind";
import { PropsTable } from "@/components/app/docs/props-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/motion/tabs";
import { NewBadge } from "@/components/app/docs/new-badge";
import { ComponentGuide } from "@/components/app/docs/component-guide";
import { CopyPage } from "@/components/app/docs/copy-page";
import {
  PreviewExpand,
  PreviewExpandStage,
  PreviewExpandToggle,
  PreviewReplayToggle,
} from "@/components/app/docs/preview-fullscreen";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { getPreview, previews } from "@/components/previews";
import { pageUrlFor, withSignature } from "@/lib/signature";
import { readSourceFile } from "@/lib/source-files";
import { getComponentProps } from "@/lib/props-extractor";
import { componentDates } from "@/lib/component-dates";
import { findNativeComponent } from "@/lib/native";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { RelatedSection } from "@/components/app/docs/related-section";
import { PagePager } from "@/components/app/docs/page-pager";
import {
  breadcrumbJsonLd,
  componentJsonLd,
  componentKeywords,
  relatedComponents,
} from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.filter((c) => c.slug !== "charts").flatMap((c) =>
    c.components.map((comp) => ({ category: c.slug, slug: comp.slug })),
  );
}

type ComponentParams = Promise<{
  locale: string;
  category: string;
  slug: string;
}>;

/** Registry entry with translated name, description, examples and guide. */
function localizeEntry(comp: ComponentEntry, messages: SiteMessages) {
  return {
    ...localizeComponent(comp, messages),
    guide: comp.guide && localizeGuide(comp.slug, comp.guide, messages),
  };
}

/**
 * Search title and meta description: lib/component-seo.ts copy through the
 * Catalog messages (English when a language has no translation).
 */
async function pageCopy(comp: ComponentEntry, messages: SiteMessages, locale: Locale) {
  const t = await getTranslations({ locale, namespace: "Docs.component" });
  const seo = messages.Catalog.components[comp.slug]?.seo;
  return {
    title: seo?.title ?? t("seoTitle", { name: comp.name }),
    description:
      seo?.description ?? t("metaDescription", { description: comp.description }),
  };
}

export async function generateMetadata({
  params,
}: {
  params: ComponentParams;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const cat = findCategory(category);
  const rawComp = findComponent(category, slug);
  if (!cat || !rawComp) return {};
  const [messages, t] = await Promise.all([
    getMessages({ locale }),
    getTranslations({ locale, namespace: "Docs.component" }),
  ]);
  const comp = localizeComponent(rawComp, messages);
  const installSlugs =
    comp.examples?.flatMap((example) =>
      example.installSlug ? [example.installSlug] : [],
    ) ?? [];
  const registryItem = installSlugs[0]
    ? `/r/${installSlugs[0]}.json`
    : `/r/${comp.slug}.json`;
  const directoryItem = installSlugs[0]
    ? `/${installSlugs[0]}.json`
    : `/${comp.slug}.json`;

  const { title, description: metaDescription } = await pageCopy(
    comp,
    messages,
    locale,
  );
  const ogTitle = `${title} · beUI`;
  const alternates = localeAlternates(componentPath(cat.slug, comp.slug), locale);
  const imageUrl = `/api/og?component=${comp.slug}`;
  // Search keywords stay English.
  const keywords = componentKeywords(cat, rawComp);

  return {
    title,
    description: metaDescription,
    keywords,
    openGraph: {
      title: ogTitle,
      description: metaDescription,
      url: alternates.canonical,
      type: "article",
      siteName: "beUI",
      locale: LANGUAGES[locale].og,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: t("ogImageAlt", { name: comp.name }),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    alternates: {
      ...alternates,
      types: {
        "application/json":
          installSlugs.length > 0 ? `/r/${comp.slug}` : `/r/${comp.slug}.json`,
        "text/plain": `/r/${comp.slug}/raw`,
      },
    },
    other: {
      "beui:category": cat.slug,
      "beui:component": comp.slug,
      "beui:registry-item": registryItem,
      "beui:directory-item": directoryItem,
      ...(installSlugs.length > 0
        ? {
            "beui:variant-registry-items": installSlugs.map(
              (installSlug) => `/r/${installSlug}.json`,
            ),
          }
        : {}),
    },
  };
}

async function loadSource(file: string) {
  return readSourceFile(file);
}

export default async function ComponentPage({
  params,
}: {
  params: ComponentParams;
}) {
  const { locale, category, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const cat = findCategory(category);
  const rawComp = findComponent(category, slug);
  if (!cat || !rawComp) notFound();
  const [messages, t, tDocs, format] = await Promise.all([
    getMessages(),
    getTranslations("Docs.component"),
    getTranslations("Docs"),
    getFormatter(),
  ]);
  const comp = localizeEntry(rawComp, messages);
  const { title, description } = await pageCopy(comp, messages, locale);
  const catName = localizeCategory(cat, messages).name;
  const hasVariantInstallCommands =
    comp.examples?.some((example) => example.installSlug) ?? false;
  const examplesShareSource =
    (comp.examples?.length ?? 0) > 1 &&
    new Set(comp.examples?.map((example) => example.file)).size === 1;
  const shouldShowExampleApi = (index: number) =>
    !examplesShareSource || index === (comp.examples?.length ?? 0) - 1;
  const dates = componentDates(cat.slug, comp.slug);
  const related = relatedComponents(cat.slug, comp.slug, 3).map((rel) => {
    const text = messages.Catalog.components[rel.slug];
    return text ? { ...rel, name: text.name, description: text.description ?? rel.description } : rel;
  });
  const propsDocs = comp.examples?.length ? [] : getComponentProps(comp.file);
  const creditUrl = comp.credit ? new URL(comp.credit.url) : null;
  creditUrl?.searchParams.set("ref", "beui");

  const nativeComponent = findNativeComponent(comp.slug);
  const webContent = (
    <>
      {comp.examples?.length ? (
        <div className="mt-10 flex flex-col gap-12">
          {comp.examples.map((ex, index) => (
            <ExampleBlock
              key={ex.slug}
              category={cat.slug}
              pageSlug={comp.slug}
              example={ex}
              showApiReference={shouldShowExampleApi(index)}
            />
          ))}
        </div>
      ) : (
        <DefaultTabs
          category={category}
          slug={slug}
          file={comp.file}
          usageFile={comp.usageFile}
        />
      )}

      {!hasVariantInstallCommands ? (
        <section
          id="install"
          className="mt-12 scroll-mt-24 border-t border-border pt-8"
        >
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">
              {t("install")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("installDescription")}
            </p>
            <div className="mt-3">
              <InstallBlock category={cat.slug} slug={comp.slug} />
            </div>
          </div>
        </section>
      ) : null}

      {propsDocs.length ? (
        <section
          id="api-reference"
          className="mt-12 scroll-mt-24 border-t border-border pt-8"
        >
          <h2 className="text-sm font-semibold text-foreground">
            {t("apiReference")}
          </h2>
          <div className="mt-4">
            <PropsTable docs={propsDocs} />
          </div>
        </section>
      ) : null}
    </>
  );

  return (
    <div className="min-w-0">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "beUI", path: localizedPath("/", locale) },
            { name: catName, path: localizedPath(categoryPath(cat.slug), locale) },
            {
              name: comp.name,
              path: localizedPath(componentPath(cat.slug, comp.slug), locale),
            },
          ]),
          componentJsonLd(cat, comp, { headline: title, description, locale }),
        ]}
      />
      <div id="overview" className="scroll-mt-24">
        <nav
          aria-label={tDocs("breadcrumb")}
          className="flex items-center gap-1.5 text-sm"
        >
          <Link
            href={categoryPath(cat.slug)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {catName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{comp.name}</span>
        </nav>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-medium tracking-tight text-foreground">
              {comp.name}
            </h1>
            {comp.badge === "new" ? (
              <NewBadge launchedAt={comp.launchedAt} className="mt-1" />
            ) : null}
          </div>
          <CopyPage
            pageUrl={pageUrlFor(cat.slug, comp.slug)}
            markdownPath={`${componentPath(cat.slug, comp.slug)}.md`}
            componentName={rawComp.name}
          />
        </div>
      </div>

      {/* Wide screens pick the platform from the right sidebar. */}
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>
      {webContent}

      {comp.guide ? <ComponentGuide guide={comp.guide} /> : null}

      {nativeComponent ? (
        <Link
          href={nativeComponentPath(comp.slug)}
          className="group mt-12 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Smartphone aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-foreground">{t("alsoOnNative")}</span>{" "}
            <span className="text-muted-foreground">{nativeComponent.description}</span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : null}
      <RelatedSection related={related} />

      {comp.credit ? (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-sm font-semibold text-foreground">{t("contributedBy")}</h2>
          <a
            href={creditUrl?.toString()}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <span className="underline underline-offset-2">{comp.credit.name}</span>
          </a>
        </section>
      ) : null}
      {cat.slug === "blocks" ? <KeepInMind /> : null}
      <p className="mt-6 text-xs text-muted-foreground">
        {t.rich("updated", {
          date: format.dateTime(new Date(`${dates.updatedAt}T00:00:00Z`), {
            dateStyle: "medium",
            timeZone: "UTC",
          }),
          time: (chunks) => <time dateTime={dates.updatedAt}>{chunks}</time>,
        })}
      </p>
      <PagePager category={cat.slug} slug={comp.slug} />
    </div>
  );
}

async function ExampleBlock({
  category,
  pageSlug,
  example,
  showApiReference,
}: {
  category: string;
  pageSlug: string;
  example: ComponentExample;
  showApiReference: boolean;
}) {
  const Preview = previews[example.previewKey];
  const usageFile = example.usageFile ?? example.previewFile;
  const [source, usage, t] = await Promise.all([
    loadSource(example.file),
    loadSource(usageFile),
    getTranslations("Docs.component"),
  ]);
  const installSlug = example.installSlug ?? null;
  const propsDocs = showApiReference ? getComponentProps(example.file) : [];

  return (
    <section id={example.slug} className="scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            {example.name}
          </h2>
          {example.badge === "new" ? (
            <NewBadge launchedAt={example.launchedAt} />
          ) : null}
        </div>
        <code className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
          {example.file.split("/").pop()}
        </code>
      </div>
      <div id={`${example.slug}-preview`} className="scroll-mt-24">
        <PreviewExpand stageId={`${example.slug}-stage`}>
        <Tabs defaultValue="preview" variant="pill">
          <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger
              value="preview"
              indicatorClassName="bg-background"
              className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
            >
              {t("preview")}
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              indicatorClassName="bg-background"
              className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
            >
              {t("usage")}
            </TabsTrigger>
            <TabsTrigger
              value="source"
              indicatorClassName="bg-background"
              className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
            >
              {t("code")}
            </TabsTrigger>
          </TabsList>
            <div className="flex items-center gap-2">
            <PreviewReplayToggle />
            <PreviewExpandToggle />
          </div>
          </div>
          <TabsContent value="preview" className="mt-4">
            <PreviewExpandStage className="flex min-h-[260px] items-center justify-center py-10">
              {Preview ? <Preview /> : null}
            </PreviewExpandStage>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
            <CodeBlock code={usage} filename={usageFile} />
          </TabsContent>
          <TabsContent value="source" className="mt-4">
            <CodeBlock
              code={withSignature(
                source,
                example.file,
                pageUrlFor(category, pageSlug),
              )}
              filename={example.file}
            />
          </TabsContent>
        </Tabs>
        </PreviewExpand>
      </div>
      {installSlug ? (
        <div
          id={`${example.slug}-install`}
          className="mt-5 min-w-0 scroll-mt-24 border-t border-border pt-5"
        >
          <h2 className="text-sm font-semibold text-foreground">
            {t("install")}
          </h2>
          <div className="mt-3">
            <InstallBlock category={category} slug={installSlug} />
          </div>
        </div>
      ) : null}
      {propsDocs.length ? (
        <div
          id={`${example.slug}-api-reference`}
          className="mt-5 min-w-0 scroll-mt-24 border-t border-border pt-5"
        >
          <h2 className="text-sm font-semibold text-foreground">
            {t("apiReference")}
          </h2>
          <div className="mt-3">
            <PropsTable docs={propsDocs} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

async function DefaultTabs({
  category,
  slug,
  file,
  usageFile,
}: {
  category: string;
  slug: string;
  file: string;
  usageFile?: string;
}) {
  const Preview = getPreview(category, slug);
  const previewFile = `components/previews/${category}/${slug}.preview.tsx`;
  const resolvedUsageFile = usageFile ?? previewFile;
  const [source, usage, t] = await Promise.all([
    loadSource(file),
    loadSource(resolvedUsageFile),
    getTranslations("Docs.component"),
  ]);

  return (
    <section id="preview" className="mt-8 scroll-mt-24">
      <h2 className="sr-only">{t("preview")}</h2>
      <PreviewExpand stageId="preview-stage">
      <Tabs defaultValue="preview" variant="pill">
        <div className="flex items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger
            value="preview"
            indicatorClassName="bg-background"
            className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
          >
            {t("preview")}
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            indicatorClassName="bg-background"
            className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
          >
            {t("usage")}
          </TabsTrigger>
          <TabsTrigger
            value="source"
            indicatorClassName="bg-background"
            className="aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
          >
            {t("code")}
          </TabsTrigger>
        </TabsList>
          <div className="flex items-center gap-2">
            <PreviewReplayToggle />
            <PreviewExpandToggle />
          </div>
        </div>
        <TabsContent value="preview" className="mt-4">
          <PreviewExpandStage className="flex min-h-[320px] items-center justify-center py-10">
            {Preview ? <Preview /> : null}
          </PreviewExpandStage>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <CodeBlock code={usage} filename={resolvedUsageFile} />
        </TabsContent>
        <TabsContent value="source" className="mt-4">
          <CodeBlock
            code={withSignature(source, file, pageUrlFor(category, slug))}
            filename={file}
          />
        </TabsContent>
      </Tabs>
      </PreviewExpand>
    </section>
  );
}
