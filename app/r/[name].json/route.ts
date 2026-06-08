import { NextResponse } from "next/server";
import { allComponents } from "@/lib/registry";
import { buildShadcnItem, findCategoryBySlug } from "@/lib/registry-server";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allComponents().map((component) => ({ name: component.slug }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  const category = findCategoryBySlug(name);
  if (!category) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const item = await buildShadcnItem(category.slug, name);
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
