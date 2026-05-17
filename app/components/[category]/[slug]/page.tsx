import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { promises as fs } from "node:fs";
import path from "node:path";
import { findCategory, findComponent, registry } from "@/lib/registry";
import { CodeBlock } from "@/components/app/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { getPreview } from "@/components/previews";

export function generateStaticParams() {
  return registry.flatMap((c) =>
    c.components.map((comp) => ({ category: c.slug, slug: comp.slug })),
  );
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

  const Preview = getPreview(category, slug);
  const source = await loadSource(comp.file);
  const previewFile = `components/previews/${category}/${slug}.preview.tsx`;
  const usage = await loadSource(previewFile);

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
          <CodeBlock code={source} filename={comp.file} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
