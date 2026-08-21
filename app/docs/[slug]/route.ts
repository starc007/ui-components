import { buildGuideMarkdown, GUIDE_SLUGS } from "@/lib/guide-markdown";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug: `${slug}.md` }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug.endsWith(".md")) {
    return new Response("not_found", { status: 404 });
  }

  const guideSlug = slug.slice(0, -3);
  const markdown = buildGuideMarkdown(guideSlug);
  if (!markdown) return new Response("not_found", { status: 404 });

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "x-robots-tag": "noindex",
      link: `</docs/${guideSlug}>; rel="canonical"; type="text/html"`,
    },
  });
}
