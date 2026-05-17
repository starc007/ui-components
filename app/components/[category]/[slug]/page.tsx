import { notFound } from "next/navigation";
import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";
import { findCategory, findComponent, registry } from "@/lib/registry";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CodeBlock } from "@/components/app/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/components">Components</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/components/${cat.slug}`}>{cat.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{comp.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{comp.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{comp.description}</p>

      <Tabs defaultValue="preview" className="mt-8">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex min-h-[320px] items-center justify-center p-10">
              {Preview ? <Preview /> : null}
            </div>
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
