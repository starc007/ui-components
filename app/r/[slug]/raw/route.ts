import { allRegistryTargets, findCategoryBySlug, findRegistryTarget } from "@/lib/registry-server";
import { readSourceFile } from "@/lib/source-files";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allRegistryTargets().map((c) => ({ slug: c.slug }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const cat = findCategoryBySlug(slug);
  if (!cat) return new Response("not_found", { status: 404 });
  const comp = findRegistryTarget(slug);
  if (!comp) return new Response("not_found", { status: 404 });
  try {
    const src = await readSourceFile(comp.file);
    return new Response(src, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=3600",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, OPTIONS",
        "x-robots-tag": "noindex",
        "link": `</r/${slug}>; rel="alternate"; type="application/json"`,
      },
    });
  } catch {
    return new Response("source_unavailable", { status: 500 });
  }
}
