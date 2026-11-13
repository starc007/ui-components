import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowRight, ArrowUpRight, ChevronRight, Smartphone } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { CodeBlock } from "@/components/app/docs/code-block";
import { ComponentGuide } from "@/components/app/docs/component-guide";
import { CopyPage } from "@/components/app/docs/copy-page";
import { InstallBlock } from "@/components/app/docs/install-block";
import { KeepInMind } from "@/components/app/docs/keep-in-mind";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PagePager } from "@/components/app/docs/page-pager";
import {
  PreviewExpand,
  PreviewExpandStage,
  PreviewExpandToggle,
  PreviewReplayToggle,
} from "@/components/app/docs/preview-fullscreen";
import { ProBlocksSection } from "@/components/app/docs/pro-blocks-section";
import { PropsTable } from "@/components/app/docs/props-table";
import { type RelatedItem, RelatedSection } from "@/components/app/docs/related-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { getPreview, previews } from "@/components/previews";
import { getTranslations } from "@/i18n/server";
import { componentDates } from "@/lib/component-dates";
import { categoryPath, componentPath, nativeComponentPath } from "@/lib/component-paths";
import { componentSeo } from "@/lib/component-seo";
import { EASE_OUT_CSS } from "@/lib/ease";
import type { Metadata } from "@/lib/head";
import { type HighlightedCode, highlight } from "@/lib/highlight";
import { buildManualInstall, type ManualInstallData } from "@/lib/manual-install";
import { findNativeComponent } from "@/lib/native";
import { Link } from "@/lib/navigation";
import { ogImagePath } from "@/lib/og-paths";
import { type ComponentPropsDoc, getComponentProps } from "@/lib/props-extractor";
import {
  BLOCK_CATEGORIES,
  type ComponentCredit,
  type ComponentEntry,
  type ComponentExample,
  findCategory,
  findComponent,
} from "@/lib/registry";
import {
  breadcrumbJsonLd,
  componentJsonLd,
  componentKeywords,
  relatedComponents,
} from "@/lib/seo";
import { pageUrlFor, withSignature } from "@/lib/signature";
import { readSourceFile } from "@/lib/source-files";
import { cn } from "@/lib/utils";

type ComponentPageInput = { category: string; slug: string };

type ExampleData = {
  example: ComponentExample;
  source: HighlightedCode;
  usage: HighlightedCode;
  propsDocs: ComponentPropsDoc[];
  manual: ManualInstallData | null;
};

type CreditGroup = { credit: ComponentCredit; examples: ComponentExample[] };

/**
 * Everything a component page shows that needs the repository or Shiki:
 * sources, usage files, props docs and the manual install files. Runs at
 * build time; client navigation fetches the result as static JSON.
 */
export const getComponentPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((input: ComponentPageInput) => input)
  .handler(async ({ data: { category, slug } }) => {
    const cat = findCategory(category);
    const comp = findComponent(category, slug);
    if (!cat || !comp) return null;

    const t = getTranslations("Docs.component");
    const seo = componentSeo[comp.slug];
    const title = seo?.title ?? t("seoTitle", { name: comp.name });
    const description =
      seo?.description ?? t("metaDescription", { description: comp.description });
    const catName = cat.name;
    const pageUrl = pageUrlFor(cat.slug, comp.slug);

    const examples: ExampleData[] = [];
    const examplesShareSource =
      (comp.examples?.length ?? 0) > 1 &&
      new Set(comp.examples?.map((example) => example.file)).size === 1;
    for (const [index, example] of (comp.examples ?? []).entries()) {
      const usageFile = example.usageFile ?? example.previewFile;
      const showApi = !examplesShareSource || index === (comp.examples?.length ?? 0) - 1;
      const [source, usage, manual] = await Promise.all([
        readSourceFile(example.file).then((code) =>
          highlight(withSignature(code, example.file, pageUrl), { filename: example.file }),
        ),
        readSourceFile(usageFile).then((code) => highlight(code, { filename: usageFile })),
        example.installSlug ? buildManualInstall(cat.slug, example.installSlug) : null,
      ]);
      examples.push({
        example,
        source,
        usage,
        propsDocs: showApi ? getComponentProps(example.file) : [],
        manual,
      });
    }

    let main: { source: HighlightedCode; usage: HighlightedCode } | null = null;
    if (!comp.examples?.length) {
      const usageFile = comp.usageFile ?? `components/previews/${category}/${slug}.preview.tsx`;
      const [source, usage] = await Promise.all([
        readSourceFile(comp.file).then((code) =>
          highlight(withSignature(code, comp.file, pageUrl), { filename: comp.file }),
        ),
        readSourceFile(usageFile).then((code) => highlight(code, { filename: usageFile })),
      ]);
      main = { source, usage };
    }
    const hasVariantInstallCommands = examples.some(({ example }) => example.installSlug);

    const related: RelatedItem[] = relatedComponents(cat.slug, comp.slug, 3);

    // One contributor for every example: credit them once, under the title.
    const exampleCredits = comp.examples?.map((example) => example.credit) ?? [];
    const sharedCredit =
      exampleCredits.length > 0 &&
      exampleCredits.every((credit) => credit && credit.url === exampleCredits[0]?.url)
        ? exampleCredits[0]
        : undefined;
    const pageCredit = comp.credit ?? sharedCredit;
    const creditGroups: CreditGroup[] = pageCredit
      ? []
      : Object.values(
          (comp.examples ?? []).reduce<Record<string, CreditGroup>>((groups, example) => {
            if (!example.credit) return groups;
            const key = example.credit.url;
            groups[key] ??= { credit: example.credit, examples: [] };
            groups[key].examples.push(example);
            return groups;
          }, {}),
        );

    const native = findNativeComponent(comp.slug);
    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: "beUI", path: "/" },
        { name: catName, path: categoryPath(cat.slug) },
        { name: comp.name, path: componentPath(cat.slug, comp.slug) },
      ]),
      componentJsonLd(cat, comp, { headline: title, description }),
    ];

    return {
      metadata: componentMetadata({
        catSlug: cat.slug,
        comp,
        keywords: componentKeywords(cat, comp),
        title,
        description,
        imageAlt: t("ogImageAlt", { name: comp.name }),
      }),
      jsonLd,
      catSlug: cat.slug,
      catName,
      comp,
      englishName: comp.name,
      examples,
      sharedCredit: Boolean(sharedCredit),
      pageCredit: pageCredit ?? null,
      creditGroups,
      main,
      manual: hasVariantInstallCommands ? null : await buildManualInstall(cat.slug, comp.slug),
      hasVariantInstallCommands,
      propsDocs: comp.examples?.length ? [] : getComponentProps(comp.file),
      related,
      nativeDescription: native?.description ?? null,
      updatedAt: componentDates(cat.slug, comp.slug).updatedAt,
    };
  });

export type ComponentPageData = NonNullable<Awaited<ReturnType<typeof getComponentPage>>>;

/** Loader for the three routes that render component pages. */
export async function loadComponentPage(input: ComponentPageInput) {
  const data = await getComponentPage({ data: input });
  if (!data) throw notFound();
  return data;
}

function componentMetadata({
  catSlug,
  comp,
  keywords,
  title,
  description,
  imageAlt,
}: {
  catSlug: string;
  comp: ComponentEntry;
  keywords: string[];
  title: string;
  description: string;
  imageAlt: string;
}): Metadata {
  const installSlugs = comp.examples?.flatMap((example) =>
    example.installSlug ? [example.installSlug] : [],
  ) ?? [];
  const registryItem = installSlugs[0] ? `/r/${installSlugs[0]}.json` : `/r/${comp.slug}.json`;
  const directoryItem = installSlugs[0] ? `/${installSlugs[0]}.json` : `/${comp.slug}.json`;
  const ogTitle = `${title} · beUI`;
  const path = componentPath(catSlug, comp.slug);
  const imageUrl = ogImagePath("component", comp.slug);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      type: "article",
      siteName: "beUI",
      locale: "en_US",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [imageUrl] },
    alternates: {
      canonical: path,
      types: {
        "application/json":
          installSlugs.length > 0 ? `/r/${comp.slug}` : `/r/${comp.slug}.json`,
        "text/plain": `/r/${comp.slug}/raw`,
      },
    },
    other: {
      "beui:category": catSlug,
      "beui:component": comp.slug,
      "beui:registry-item": registryItem,
      "beui:directory-item": directoryItem,
      ...(installSlugs.length > 0
        ? { "beui:variant-registry-items": installSlugs.map((slug) => `/r/${slug}.json`) }
        : {}),
    },
  };
}

export function ComponentPage({ data }: { data: ComponentPageData }) {
  const t = useTranslations("Docs.component");
  const tDocs = useTranslations("Docs");
  const format = useFormatter();
  const { comp, catSlug, catName, pageCredit, creditGroups } = data;

  return (
    <div className="min-w-0">
      <JsonLd data={data.jsonLd} />
      <div id="overview" className="scroll-mt-24">
        <nav aria-label={tDocs("breadcrumb")} className="flex items-center gap-1.5 text-sm">
          <Link
            href={categoryPath(catSlug)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {catName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{comp.name}</span>
        </nav>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-medium tracking-tight text-foreground">
                {comp.name}
              </h1>
              {comp.badge === "new" ? (
                <NewBadge launchedAt={comp.launchedAt} className="mt-1" />
              ) : null}
            </div>
            {pageCredit ? (
              <CreditLink credit={pageCredit} className="mt-3" />
            ) : creditGroups.length ? (
              <CreditSummary groups={creditGroups} className="mt-3" />
            ) : null}
          </div>
          <CopyPage
            pageUrl={pageUrlFor(catSlug, comp.slug)}
            markdownPath={`${componentPath(catSlug, comp.slug)}.md`}
            componentName={data.englishName}
          />
        </div>
      </div>

      {/* Wide screens pick the platform from the right sidebar. */}
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>

      {data.examples.length ? (
        <div className="mt-10 flex flex-col gap-12">
          {data.examples.map((example) => (
            <ExampleBlock
              key={example.example.slug}
              data={example}
              showCredit={!data.sharedCredit}
            />
          ))}
        </div>
      ) : data.main ? (
        <DefaultTabs category={catSlug} slug={comp.slug} {...data.main} />
      ) : null}

      {!data.hasVariantInstallCommands ? (
        <section id="install" className="mt-12 scroll-mt-24 border-t border-border pt-8">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{t("install")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("installDescription")}</p>
            <div className="mt-3">
              <InstallBlock slug={comp.slug} manual={data.manual} />
            </div>
          </div>
        </section>
      ) : null}

      {data.propsDocs.length ? (
        <section id="api-reference" className="mt-12 scroll-mt-24 border-t border-border pt-8">
          <h2 className="text-sm font-semibold text-foreground">{t("apiReference")}</h2>
          <div className="mt-4">
            <PropsTable docs={data.propsDocs} />
          </div>
        </section>
      ) : null}

      {comp.guide ? <ComponentGuide guide={comp.guide} /> : null}

      {data.nativeDescription ? (
        <Link
          href={nativeComponentPath(comp.slug)}
          className="group mt-12 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Smartphone aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-foreground">{t("alsoOnNative")}</span>{" "}
            <span className="text-muted-foreground">{data.nativeDescription}</span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : null}
      <ProBlocksSection
        pageKey={`${catSlug}/${comp.slug}`}
        className="mt-12 border-t border-border pt-8"
      />
      <RelatedSection related={data.related} />

      {BLOCK_CATEGORIES.includes(catSlug) ? <KeepInMind /> : null}
      <p className="mt-6 text-xs text-muted-foreground">
        {t.rich("updated", {
          date: format.dateTime(new Date(`${data.updatedAt}T00:00:00Z`), {
            dateStyle: "medium",
            timeZone: "UTC",
          }),
          time: (chunks) => <time dateTime={data.updatedAt}>{chunks}</time>,
        })}
      </p>
      <PagePager category={catSlug} slug={comp.slug} />
    </div>
  );
}

const AVATAR_CLASS =
  "size-5 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** "Includes" so the title line doesn't claim designs others built. */
function CreditSummary({ groups, className }: { groups: CreditGroup[]; className?: string }) {
  const t = useTranslations("Docs.component");
  const locale = useLocale();
  const parts = new Intl.ListFormat(locale, { type: "conjunction" }).formatToParts(
    groups.map(({ credit }) => credit.name),
  );
  let next = 0;
  return (
    <p className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span aria-hidden="true" className="flex shrink-0">
        {groups.slice(0, 2).map(({ credit }, index) =>
          credit.avatar ? (
            <img
              key={credit.url}
              src={credit.avatar}
              alt=""
              width={20}
              height={20}
              className={cn(AVATAR_CLASS, "ring-2 ring-background", index > 0 && "-ml-1.5")}
            />
          ) : null,
        )}
      </span>
      <span>
        {t("includesDesignsBy")}{" "}
        {parts.map((part, index) => {
          if (part.type !== "element") {
            // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
            return <span key={index}>{part.value}</span>;
          }
          const group = groups[next++];
          return (
            <a
              key={group.credit.url}
              href={`#${group.examples[0].slug}`}
              className={cn(
                "rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground",
                FOCUS_RING,
              )}
              style={{ transitionTimingFunction: EASE_OUT_CSS }}
            >
              {part.value}
            </a>
          );
        })}
      </span>
    </p>
  );
}

function CreditLink({ credit, className }: { credit: ComponentCredit; className?: string }) {
  const t = useTranslations("Docs.component");
  const url = new URL(credit.url);
  url.searchParams.set("ref", "beui");
  return (
    <a
      href={url.toString()}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group -ml-1 inline-flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-sm text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground",
        FOCUS_RING,
        className,
      )}
      style={{ transitionTimingFunction: EASE_OUT_CSS }}
    >
      {credit.avatar ? (
        <img src={credit.avatar} alt="" width={20} height={20} className={AVATAR_CLASS} />
      ) : null}
      <span>
        {t("contributedBy")}{" "}
        <span className="font-medium text-foreground">{credit.name}</span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transition-none"
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      />
      <span className="sr-only">{t("opensInNewTab")}</span>
    </a>
  );
}

const TRIGGER_CLASS =
  "aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground";

function PreviewTabs({
  stageId,
  minHeight,
  preview,
  usage,
  source,
}: {
  stageId: string;
  minHeight: string;
  preview: React.ReactNode;
  usage: HighlightedCode;
  source: HighlightedCode;
}) {
  const t = useTranslations("Docs.component");
  return (
    <PreviewExpand stageId={stageId}>
      <Tabs defaultValue="preview" variant="pill">
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview" indicatorClassName="bg-background" className={TRIGGER_CLASS}>
              {t("preview")}
            </TabsTrigger>
            <TabsTrigger value="usage" indicatorClassName="bg-background" className={TRIGGER_CLASS}>
              {t("usage")}
            </TabsTrigger>
            <TabsTrigger value="source" indicatorClassName="bg-background" className={TRIGGER_CLASS}>
              {t("code")}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <PreviewReplayToggle />
            <PreviewExpandToggle />
          </div>
        </div>
        <TabsContent value="preview" className="mt-4">
          <PreviewExpandStage className={cn("flex items-center justify-center py-10", minHeight)}>
            {preview}
          </PreviewExpandStage>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <CodeBlock {...usage} />
        </TabsContent>
        <TabsContent value="source" className="mt-4">
          <CodeBlock {...source} />
        </TabsContent>
      </Tabs>
    </PreviewExpand>
  );
}

function ExampleBlock({ data, showCredit }: { data: ExampleData; showCredit: boolean }) {
  const t = useTranslations("Docs.component");
  const { example, source, usage, propsDocs, manual } = data;
  const Preview = previews[example.previewKey];

  return (
    <section id={example.slug} className="scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium tracking-tight text-foreground">{example.name}</h2>
          {example.badge === "new" ? <NewBadge launchedAt={example.launchedAt} /> : null}
        </div>
        <code className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-foreground">
          {example.file.split("/").pop()}
        </code>
      </div>
      {example.credit && showCredit ? (
        <CreditLink credit={example.credit} className="-mt-2 mb-4" />
      ) : null}
      <div id={`${example.slug}-preview`} className="scroll-mt-24">
        <PreviewTabs
          stageId={`${example.slug}-stage`}
          minHeight="min-h-[260px]"
          preview={Preview ? <Preview /> : null}
          usage={usage}
          source={source}
        />
      </div>
      {example.installSlug ? (
        <div
          id={`${example.slug}-install`}
          className="mt-5 min-w-0 scroll-mt-24 border-t border-border pt-5"
        >
          <h2 className="text-sm font-semibold text-foreground">{t("install")}</h2>
          <div className="mt-3">
            <InstallBlock slug={example.installSlug} manual={manual} />
          </div>
        </div>
      ) : null}
      {propsDocs.length ? (
        <div
          id={`${example.slug}-api-reference`}
          className="mt-5 min-w-0 scroll-mt-24 border-t border-border pt-5"
        >
          <h2 className="text-sm font-semibold text-foreground">{t("apiReference")}</h2>
          <div className="mt-3">
            <PropsTable docs={propsDocs} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DefaultTabs({
  category,
  slug,
  source,
  usage,
}: {
  category: string;
  slug: string;
  source: HighlightedCode;
  usage: HighlightedCode;
}) {
  const t = useTranslations("Docs.component");
  const Preview = getPreview(category, slug);
  return (
    <section id="preview" className="mt-8 scroll-mt-24">
      <h2 className="sr-only">{t("preview")}</h2>
      <PreviewTabs
        stageId="preview-stage"
        minHeight="min-h-[320px]"
        preview={Preview ? <Preview /> : null}
        usage={usage}
        source={source}
      />
    </section>
  );
}
