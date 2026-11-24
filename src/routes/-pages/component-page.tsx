import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowRight, Smartphone } from "lucide-react";
import { useFormatter, useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { ComponentGuide } from "@/components/app/docs/component-guide";
import { CopyPage } from "@/components/app/docs/copy-page";
import { InstallBlock } from "@/components/app/docs/install-block";
import { KeepInMind } from "@/components/app/docs/keep-in-mind";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PagePager } from "@/components/app/docs/page-pager";
import { PropsTable } from "@/components/app/docs/props-table";
import { type RelatedItem, RelatedSection } from "@/components/app/docs/related-section";
import { getTranslations } from "@/i18n/server";
import { componentDates } from "@/lib/component-dates";
import { categoryPath, componentPath, nativeComponentPath } from "@/lib/component-paths";
import { componentSeo } from "@/lib/component-seo";
import { componentSummaries } from "@/lib/component-summaries";
import { type HighlightedCode, highlight } from "@/lib/highlight";
import { buildManualInstall } from "@/lib/manual-install";
import { findNativeComponent } from "@/lib/native";
import { Link } from "@/lib/navigation";
import { getComponentProps } from "@/lib/props-extractor";
import { BLOCK_CATEGORIES, findCategory, findComponent } from "@/lib/registry";
import {
  breadcrumbJsonLd,
  componentJsonLd,
  componentKeywords,
  relatedComponents,
} from "@/lib/seo";
import { pageUrlFor, withSignature } from "@/lib/signature";
import { soundApiDocs } from "@/lib/sound-api-docs";
import { readSourceFile } from "@/lib/source-files";
import { variantCopy } from "@/lib/variant-copy";
import { isSplitPage, variantPath } from "@/lib/variant-pages";
import { CreditLink } from "./component-page/credit-link";
import { CreditSummary } from "./component-page/credit-summary";
import { DefaultTabs } from "./component-page/default-tabs";
import { ExampleBlock } from "./component-page/example-block";
import { componentMetadata } from "./component-page/metadata";
import type {
  ComponentPageInput,
  CreditGroup,
  ExampleData,
  VariantCardData,
} from "./component-page/types";
import { VariantCard } from "./component-page/variant-card";

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

    // A page of separate components links to one page per variant instead of
    // rendering every variant's code here.
    const split = isSplitPage(comp);
    const variants: VariantCardData[] = split
      ? (comp.examples ?? []).map((example) => {
          const copy = example.installSlug ? variantCopy[example.installSlug] : undefined;
          return {
            slug: example.slug,
            name: copy?.name ?? example.name,
            previewKey: example.previewKey,
            href: variantPath(cat.slug, comp.slug, example.slug),
            badge: example.badge ?? null,
            launchedAt: example.launchedAt ?? null,
          };
        })
      : [];

    const examples: ExampleData[] = [];
    const examplesShareSource =
      (comp.examples?.length ?? 0) > 1 &&
      new Set(comp.examples?.map((example) => example.file)).size === 1;
    for (const [index, example] of (split ? [] : (comp.examples ?? [])).entries()) {
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
    const hasVariantInstallCommands = split || examples.some(({ example }) => example.installSlug);

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
      summary: componentSummaries[comp.slug] ?? null,
      examples,
      variants,
      sharedCredit: Boolean(sharedCredit),
      pageCredit: pageCredit ?? null,
      creditGroups,
      main,
      manual: hasVariantInstallCommands ? null : await buildManualInstall(cat.slug, comp.slug),
      hasVariantInstallCommands,
      propsDocs: comp.examples?.length
        ? []
        : cat.slug === "sounds"
          ? soundApiDocs(comp.slug)
          : getComponentProps(comp.file),
      related,
      nativeDescription: native?.description ?? null,
      updatedAt: componentDates(cat.slug, comp.slug).updatedAt,
    };
  });

export type ComponentPageData = NonNullable<Awaited<ReturnType<typeof getComponentPage>>>;

/** Loader for every route that renders a component page. */
export async function loadComponentPage(input: ComponentPageInput) {
  const data = await getComponentPage({ data: input });
  if (!data) throw notFound();
  return data;
}

export function ComponentPage({ data }: { data: ComponentPageData }) {
  const t = useTranslations("Docs.component");
  const format = useFormatter();
  const { comp, catSlug, pageCredit, creditGroups } = data;

  return (
    <div className="min-w-0">
      <JsonLd data={data.jsonLd} />
      <div id="overview" className="scroll-mt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-medium tracking-tight text-foreground">
                {comp.name}
              </h1>
              {comp.badge === "new" ? (
                <NewBadge launchedAt={comp.launchedAt} className="mt-1" />
              ) : null}
            </div>
            {data.summary ? (
              <p className="mt-2 max-w-xl text-pretty text-muted-foreground">{data.summary}</p>
            ) : null}
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

      {data.variants.length ? (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {data.variants.map((variant) => (
            <VariantCard key={variant.slug} variant={variant} component={comp} category={catSlug} />
          ))}
        </div>
      ) : data.examples.length ? (
        <div className="mt-12 flex flex-col gap-20">
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
            <h2 className="text-sm font-medium text-foreground">{t("install")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("installDescription")}</p>
            <div className="mt-3">
              <InstallBlock slug={comp.slug} manual={data.manual} />
            </div>
          </div>
        </section>
      ) : null}

      {data.propsDocs.length ? (
        <section id="api-reference" className="mt-12 scroll-mt-24 border-t border-border pt-8">
          <h2 className="text-sm font-medium text-foreground">{t("apiReference")}</h2>
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
