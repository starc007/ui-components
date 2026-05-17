import { notFound } from "next/navigation";
import { promises as fs } from "node:fs";
import path from "node:path";
import { findCategory, findComponent, registry } from "@/lib/registry";
import { Breadcrumb } from "@/components/data-nav/breadcrumb";
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
      <Breadcrumb
        items={[
          { label: "Components", href: "/components" },
          { label: cat.name, href: `/components/${cat.slug}` },
          { label: comp.name },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-fg)">{comp.name}</h1>
      <p className="mt-2 max-w-2xl text-(--color-fg-muted)">{comp.description}</p>

      <Tabs defaultValue="preview" className="mt-8">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev)">
            <div className="flex min-h-[320px] items-center justify-center p-10">
              {Preview ? <Preview /> : null}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="usage">
          <CodeBlock code={usage} filename={previewFile} />
        </TabsContent>
        <TabsContent value="source">
          <CodeBlock code={source} filename={comp.file} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
