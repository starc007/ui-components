import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { ArrowRight, Smartphone } from "lucide-react";
import { useFormatter, useTranslations } from "use-intl";
import { JsonLd, type JsonLdSchema } from "@/components/app/analytics/json-ld";
import { CopyPage } from "@/components/app/docs/copy-page";
import { AnchorHeading } from "@/components/app/docs/heading-anchor";
import { InstallBlock } from "@/components/app/docs/install-block";
import { KeepInMind } from "@/components/app/docs/keep-in-mind";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewCard } from "@/components/app/docs/preview-card";
import { PropsTable } from "@/components/app/docs/props-table";
import { type RelatedItem, RelatedSection } from "@/components/app/docs/related-section";
import { previews } from "@/components/previews";
import { getTranslations } from "@/i18n/server";
import { componentDates } from "@/lib/component-dates";
import { categoryPath, componentPath, nativeComponentPath } from "@/lib/component-paths";
import { highlight } from "@/lib/highlight";
import { buildManualInstall } from "@/lib/manual-install";
import { findNativeComponent } from "@/lib/native";
import { Link } from "@/lib/navigation";
import { getComponentProps } from "@/lib/props-extractor";
import { BLOCK_CATEGORIES, findCategory, isInstallable } from "@/lib/registry";
import { breadcrumbJsonLd, componentJsonLd, componentKeywords, relatedComponents } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { withSignature } from "@/lib/signature";
import { readSourceFile } from "@/lib/source-files";
import { variantCopy } from "@/lib/variant-copy";
import { findVariant, variantPath } from "@/lib/variant-pages";
import { CreditLink } from "./component-page/credit-link";
import { componentMetadata } from "./component-page/metadata";

type VariantPageInput = { category: string; slug: string; variant: string };

/**
 * One variant of a split component page (see `isSplitPage`): its own preview,
 * install command and props. Runs at build time like the component page.
 */
export const getVariantPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((input: VariantPageInput) => input)
  .handler(async ({ data: { category, slug, variant } }) => {
    const cat = findCategory(category);
    const found = findVariant(category, slug, variant);
    if (!cat || !found) return null;
    const { comp, example } = found;
    const { installSlug } = example;

    const t = getTranslations("Docs.component");
    const copy = variantCopy[installSlug];
    const name = copy?.name ?? example.name;
    const title = copy?.title ?? t("variantSeoTitle", { name });
    const description = copy?.description ?? example.description ?? comp.description;
    const path = variantPath(cat.slug, comp.slug, example.slug);
    const pageUrl = `${SITE_URL}${path}`;

    const usageFile = example.usageFile ?? example.previewFile;
    const [source, usage, manual] = await Promise.all([
      readSourceFile(example.file).then((code) =>
        highlight(withSignature(code, example.file, pageUrl), { filename: example.file }),
      ),
      readSourceFile(usageFile).then((code) => highlight(code, { filename: usageFile })),
      buildManualInstall(cat.slug, installSlug),
    ]);

    // The other variants of the same page, as cards that link to their pages.
    const siblings: RelatedItem[] = (comp.examples ?? [])
      .filter(isInstallable)
      .filter((other) => other.slug !== example.slug)
      .map((other) => {
        const otherCopy = variantCopy[other.installSlug];
        return {
          category: cat.slug,
          slug: other.slug,
          name: otherCopy?.name ?? other.name,
          description: otherCopy?.summary ?? other.description ?? "",
          badge: other.badge,
          launchedAt: other.launchedAt,
          href: variantPath(cat.slug, comp.slug, other.slug),
        };
      });

    const jsonLd: JsonLdSchema[] = [
      breadcrumbJsonLd([
        { name: "beUI", path: "/" },
        { name: cat.name, path: categoryPath(cat.slug) },
        { name: comp.name, path: componentPath(cat.slug, comp.slug) },
        { name, path },
      ]),
      componentJsonLd(cat, comp, {
        headline: title,
        description,
        variant: { slug: example.slug, installSlug, name, description },
      }),
    ];

    const native = findNativeComponent(comp.slug);
    return {
      metadata: componentMetadata({
        catSlug: cat.slug,
        comp,
        keywords: componentKeywords(cat, { ...comp, name }),
        title,
        description,
        imageAlt: t("ogImageAlt", { name }),
        variant: { slug: example.slug, installSlug },
      }),
      jsonLd,
      catSlug: cat.slug,
      parentName: comp.name,
      parentSlug: comp.slug,
      name,
      summary: copy?.summary ?? null,
      example,
      installSlug,
      path,
      pageUrl,
      source,
      usage,
      manual,
      propsDocs: getComponentProps(example.file),
      siblings,
      related: relatedComponents(cat.slug, comp.slug, 3),
      nativeDescription: native?.description ?? null,
      updatedAt: componentDates(cat.slug, comp.slug).updatedAt,
    };
  });

export type VariantPageData = NonNullable<Awaited<ReturnType<typeof getVariantPage>>>;

export async function loadVariantPage(input: VariantPageInput) {
  const data = await getVariantPage({ data: input });
  if (!data) throw notFound();
  return data;
}

export function VariantPage({ data }: { data: VariantPageData }) {
  const t = useTranslations("Docs.component");
  const format = useFormatter();
  const { example, catSlug } = data;
  const Preview = previews[example.previewKey];

  return (
    <div className="min-w-0">
      <JsonLd data={data.jsonLd} />
      <div id="overview" className="scroll-mt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <AnchorHeading
              as="h1"
              headingClassName="text-3xl font-medium tracking-tight text-foreground"
              trailing={
                example.badge === "new" ? (
                  <NewBadge launchedAt={example.launchedAt} className="mt-1 ml-1.5" />
                ) : null
              }
            >
              {data.name}
            </AnchorHeading>
            {data.summary ? (
              <p className="mt-2 max-w-xl text-pretty text-muted-foreground">{data.summary}</p>
            ) : null}
            {example.credit ? <CreditLink credit={example.credit} className="mt-3" /> : null}
          </div>
          <CopyPage
            pageUrl={data.pageUrl}
            markdownPath={`${data.path}.md`}
            componentName={data.name}
          />
        </div>
      </div>

      {/* Wide screens pick the platform from the right sidebar. */}
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>

      <section id="preview" className="mt-12 scroll-mt-24">
        <h2 className="sr-only">{t("preview")}</h2>
        <PreviewCard
          stageId={`${example.slug}-stage`}
          minHeight="min-h-[360px]"
          preview={Preview ? <Preview /> : null}
          usage={data.usage}
          source={data.source}
        />
      </section>

      <section id="install" className="mt-12 scroll-mt-24 border-t border-border pt-8">
        <AnchorHeading section="install" headingClassName="text-sm font-medium text-foreground">
          {t("install")}
        </AnchorHeading>
        <p className="mt-1 text-sm text-muted-foreground">{t("installDescription")}</p>
        <div className="mt-3">
          <InstallBlock slug={data.installSlug} manual={data.manual} />
        </div>
      </section>

      {data.propsDocs.length ? (
        <section id="api-reference" className="mt-12 scroll-mt-24 border-t border-border pt-8">
          <AnchorHeading
            section="api-reference"
            headingClassName="text-sm font-medium text-foreground"
          >
            {t("apiReference")}
          </AnchorHeading>
          <div className="mt-4">
            <PropsTable docs={data.propsDocs} idPrefix="api-reference" />
          </div>
        </section>
      ) : null}

      {data.nativeDescription ? (
        <Link
          href={nativeComponentPath(data.parentSlug)}
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

      <RelatedSection
        id="more-variants"
        heading={t("moreVariants", { name: data.parentName })}
        related={data.siblings}
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
    </div>
  );
}
