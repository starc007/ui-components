import { NextResponse } from "next/server";
import { allShadcnTargets, buildShadcnItem, findCategoryBySlug } from "@/lib/registry-server";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allShadcnTargets().map((component) => ({ slug: `${component.slug}.json` }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!slug.endsWith(".json")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const componentSlug = slug.replace(/\.json$/, "");
  const category = findCategoryBySlug(componentSlug);
  if (!category) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const item = await buildShadcnItem(category.slug, componentSlug, { includeContent: false });
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json(item, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "link": `</registry.json>; rel="collection"; type="application/json", </r/${componentSlug}.json>; rel="alternate"; type="application/json"`,
    },
  });
}
