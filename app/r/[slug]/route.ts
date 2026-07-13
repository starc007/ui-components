import { NextResponse } from "next/server";
import { buildComponentMarkdown } from "@/lib/component-markdown";
import { allRegistryTargets, allShadcnTargets, buildEntry, buildShadcnItem, findCategoryBySlug, findRegistryTarget } from "@/lib/registry-server";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [
    ...allRegistryTargets().map((component) => ({ slug: component.slug })),
    ...allRegistryTargets().map((component) => ({ slug: `${component.slug}.md` })),
    ...allShadcnTargets().map((component) => ({ slug: `${component.slug}.json` })),
  ];
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const isMarkdown = slug.endsWith(".md");
  const isShadcnItem = slug.endsWith(".json");
  const componentSlug = slug.replace(/\.(?:json|md)$/, "");
  const cat = findCategoryBySlug(componentSlug);
  if (!cat) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (isMarkdown) {
    const target = findRegistryTarget(componentSlug);
    if (!target) return new Response("not_found", { status: 404 });
    const requestedCategory = new URL(req.url).searchParams.get("category");
    if (requestedCategory && requestedCategory !== cat.slug) {
      return new Response("not_found", { status: 404 });
    }
    const markdown = await buildComponentMarkdown(cat.slug, target.pageSlug);
    if (!markdown) return new Response("not_found", { status: 404 });
    return new Response(markdown, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=3600",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, OPTIONS",
        "x-robots-tag": "noindex",
        link: `<${target.pageSlug === componentSlug ? `/components/${cat.slug}/${componentSlug}` : `/components/${cat.slug}/${target.pageSlug}`}>; rel="canonical"; type="text/html"`,
      },
    });
  }

  if (isShadcnItem) {
    const item = await buildShadcnItem(cat.slug, componentSlug);
    if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(item, {
      headers: {
        "cache-control": "public, max-age=300, s-maxage=3600",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, OPTIONS",
        "link": '</r/registry.json>; rel="collection"; type="application/json"',
      },
    });
  }

  const entry = await buildEntry(cat.slug, componentSlug);
  if (!entry) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(entry, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "link": `</r/${slug}/raw>; rel="alternate"; type="text/plain", </components/${cat.slug}/${componentSlug}.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"`,
    },
  });
}
