import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  findCategory,
  findComponent,
  registry,
  type ComponentExample,
} from "@/lib/registry";
import { CodeBlock } from "@/components/app/docs/code-block";
import { InstallBlock } from "@/components/app/docs/install-block";
import { KeepInMind } from "@/components/app/docs/keep-in-mind";
import { PageNav, type PageNavItem } from "@/components/app/docs/page-nav";
import { PropsTable } from "@/components/app/docs/props-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/motion/tabs";
import { NewBadge } from "@/components/app/docs/new-badge";
import { ComponentCard } from "@/components/app/docs/component-card";
import { JsonLd } from "@/components/app/analytics/json-ld";
import { getPreview, previews } from "@/components/previews";
import { pageUrlFor, withSignature } from "@/lib/signature";
import { readSourceFile } from "@/lib/source-files";
import { getComponentProps } from "@/lib/props-extractor";
import {
  breadcrumbJsonLd,
  componentJsonLd,
  componentKeywords,
  componentMetaDescription,
  relatedComponents,
} from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.flatMap((c) =>
    c.components.map((comp) => ({ category: c.slug, slug: comp.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const cat = findCategory(category);
  const comp = findComponent(category, slug);
  if (!cat || !comp) return {};
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

  const title = `${comp.name} · React motion component`;
  const ogTitle = `${title} · beUI`;
  const pageUrl = `/components/${cat.slug}/${comp.slug}`;
  const imageUrl = `/api/og?component=${comp.slug}`;
  const keywords = componentKeywords(cat, comp);
  const metaDescription = componentMetaDescription(comp);

  return {
    title,
    description: metaDescription,
    keywords,
    openGraph: {
      title: ogTitle,
      description: metaDescription,
      url: pageUrl,
      type: "article",
      siteName: "beUI",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${comp.name} component preview`,
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
      canonical: pageUrl,
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
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const cat = findCategory(category);
  const comp = findComponent(category, slug);
  if (!cat || !comp) notFound();
  const hasVariantInstallCommands =
    comp.examples?.some((example) => example.installSlug) ?? false;
  const related = relatedComponents(cat.slug, comp.slug, 3);
  const propsDocs = comp.examples?.length ? [] : getComponentProps(comp.file);
  const variantNavItems: PageNavItem[] =
    comp.examples?.map((example) => ({
      id: example.slug,
      label: example.name,
      children: [
        { id: `${example.slug}-preview`, label: "Preview" },
        ...(example.installSlug
          ? [{ id: `${example.slug}-install`, label: "Install" }]
          : []),
        ...(getComponentProps(example.file).length
          ? [
              {
                id: `${example.slug}-api-reference`,
                label: "API Reference",
              },
            ]
          : []),
      ],
    })) ?? [];
  const pageNavItems: PageNavItem[] = [
    ...(variantNavItems.length
      ? variantNavItems
      : [
          {
            id: "overview",
            label: comp.name,
            children: [
              { id: "preview", label: "Preview" },
              ...(!hasVariantInstallCommands
                ? [{ id: "install", label: "Install" }]
                : []),
              ...(propsDocs.length
                ? [{ id: "api-reference", label: "API Reference" }]
                : []),
            ],
          },
        ]),
    ...(related.length
      ? [{ id: "related-components", label: "Related components" }]
      : []),
  ];

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-10 2xl:gap-14">
      <div className="min-w-0">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: "beUI", path: "/" },
              { name: cat.name, path: `/components/${cat.slug}` },
              { name: comp.name, path: `/components/${cat.slug}/${comp.slug}` },
            ]),
            componentJsonLd(cat, comp),
          ]}
        />
        <div id="overview" className="scroll-mt-24">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm"
          >
            <Link
              href={`/components/${cat.slug}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {cat.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{comp.name}</span>
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {comp.name}
            </h1>
            {comp.badge === "new" ? <NewBadge className="mt-1" /> : null}
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {comp.description}
          </p>
        </div>

        {comp.examples?.length ? (
          <div className="mt-10 flex flex-col gap-12">
            {comp.examples.map((ex) => (
              <ExampleBlock
                key={ex.slug}
                category={cat.slug}
                pageSlug={comp.slug}
                example={ex}
              />
            ))}
          </div>
        ) : (
          <DefaultTabs category={category} slug={slug} file={comp.file} />
        )}

        {!hasVariantInstallCommands ? (
          <section
            id="install"
            className="mt-12 scroll-mt-24 border-t border-border pt-8"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Install</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add it with the shadcn CLI, or copy the source manually.
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
              API Reference
            </h2>
            <div className="mt-4">
              <PropsTable docs={propsDocs} />
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section
            id="related-components"
            className="mt-12 scroll-mt-24 border-t border-border pt-8"
          >
            <h2 className="text-sm font-semibold text-foreground">
              Related components
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {related.map((rel) => (
                <ComponentCard
                  key={`${rel.category}/${rel.slug}`}
                  categorySlug={rel.category}
                  slug={rel.slug}
                  name={rel.name}
                  description={rel.description}
                  badge={rel.badge}
                />
              ))}
            </div>
          </section>
        ) : null}

        <KeepInMind />
      </div>
      <PageNav items={pageNavItems} />
    </div>
  );
}

async function ExampleBlock({
  category,
  pageSlug,
  example,
}: {
  category: string;
  pageSlug: string;
  example: ComponentExample;
}) {
  const Preview = previews[example.previewKey];
  const source = await loadSource(example.file);
  const usage = await loadSource(example.previewFile);
  const installSlug = example.installSlug ?? null;
  const propsDocs = getComponentProps(example.file);

  return (
    <section id={example.slug} className="scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {example.name}
        </h2>
        <code className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {example.file.split("/").pop()}
        </code>
      </div>
      {example.description ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {example.description}
        </p>
      ) : null}
      <div id={`${example.slug}-preview`} className="scroll-mt-24">
        <Tabs defaultValue="preview" variant="pill">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="source">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="flex min-h-[260px] items-center justify-center py-10">
              {Preview ? <Preview /> : null}
            </div>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
            <CodeBlock code={usage} filename={example.previewFile} />
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
      </div>
      {installSlug ? (
        <div
          id={`${example.slug}-install`}
          className="mt-5 min-w-0 scroll-mt-24 border-t border-border pt-5"
        >
          <h3 className="text-sm font-semibold text-foreground">Install</h3>
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
          <h3 className="text-sm font-semibold text-foreground">
            API Reference
          </h3>
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
}: {
  category: string;
  slug: string;
  file: string;
}) {
  const Preview = getPreview(category, slug);
  const previewFile = `components/previews/${category}/${slug}.preview.tsx`;
  const source = await loadSource(file);
  const usage = await loadSource(previewFile);

  return (
    <section id="preview" className="mt-8 scroll-mt-24">
      <Tabs defaultValue="preview" variant="pill">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="source">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <div className="flex min-h-[320px] items-center justify-center py-10">
            {Preview ? <Preview /> : null}
          </div>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <CodeBlock code={usage} filename={previewFile} />
        </TabsContent>
        <TabsContent value="source" className="mt-4">
          <CodeBlock
            code={withSignature(source, file, pageUrlFor(category, slug))}
            filename={file}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
