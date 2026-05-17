import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { promises as fs } from "node:fs";
import path from "node:path";
import { findCategory, findComponent, registry, type ComponentExample } from "@/lib/registry";
import { CodeBlock } from "@/components/app/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { getPreview, previews } from "@/components/previews";

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
  const comp = findComponent(category, slug);
  if (!comp) return {};
  return {
    title: `${comp.name} · beUI v2`,
    description: comp.description,
    alternates: {
      canonical: `/components/${category}/${slug}`,
      types: {
        "application/json": `/r/${slug}`,
        "text/plain": `/r/${slug}/raw`,
      },
    },
  };
}

async function loadSource(file: string) {
  try {
    const p = path.join(process.cwd(), file);
    return await fs.readFile(p, "utf8");
  } catch {
    return "// source unavailable";
  }
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

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link href={`/components/${cat.slug}`} className="text-(--color-fg-muted) transition-colors hover:text-(--color-fg)">
          {cat.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-(--color-fg-muted)" />
        <span className="font-medium text-(--color-fg)">{comp.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-fg)">{comp.name}</h1>
      <p className="mt-2 max-w-2xl text-(--color-fg-muted)">{comp.description}</p>

      {comp.examples?.length ? (
        <div className="mt-10 flex flex-col gap-12">
          {comp.examples.map((ex) => (
            <ExampleBlock key={ex.slug} example={ex} />
          ))}
        </div>
      ) : (
        <DefaultTabs category={category} slug={slug} file={comp.file} />
      )}
    </div>
  );
}

async function ExampleBlock({ example }: { example: ComponentExample }) {
  const Preview = previews[example.previewKey];
  const source = await loadSource(example.file);
  const usage = await loadSource(example.previewFile);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-(--color-fg)">{example.name}</h2>
        <code className="rounded-md bg-(--color-fg)/5 px-2 py-0.5 font-mono text-[11px] text-(--color-fg-muted)">
          {example.file.split("/").pop()}
        </code>
      </div>
      {example.description ? (
        <p className="mb-4 text-sm text-(--color-fg-muted)">{example.description}</p>
      ) : null}
      <Tabs defaultValue="preview" variant="pill">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-bg-elev) py-10">
            {Preview ? <Preview /> : null}
          </div>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <CodeBlock code={usage} filename={example.previewFile} />
        </TabsContent>
        <TabsContent value="source" className="mt-4">
          <CodeBlock code={source} filename={example.file} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

async function DefaultTabs({ category, slug, file }: { category: string; slug: string; file: string }) {
  const Preview = getPreview(category, slug);
  const previewFile = `components/previews/${category}/${slug}.preview.tsx`;
  const source = await loadSource(file);
  const usage = await loadSource(previewFile);

  return (
    <Tabs defaultValue="preview" variant="pill" className="mt-8">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="source">Source</TabsTrigger>
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
        <CodeBlock code={source} filename={file} />
      </TabsContent>
    </Tabs>
  );
}
