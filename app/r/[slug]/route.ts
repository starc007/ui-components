import { NextResponse } from "next/server";
import { allComponents } from "@/lib/registry";
import { buildEntry, findCategoryBySlug } from "@/lib/registry-server";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allComponents().map((c) => ({ slug: c.slug }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const cat = findCategoryBySlug(slug);
  if (!cat) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const entry = await buildEntry(cat.slug, slug);
  if (!entry) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(entry, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "link": `</r/${slug}/raw>; rel="alternate"; type="text/plain", </llms.txt>; rel="describedby"; type="text/plain"`,
    },
  });
}
