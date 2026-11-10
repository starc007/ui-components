import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { highlight } from "@/lib/highlight";
import { findSeoPage, seoPageMetadata } from "@/lib/seo-pages";
import type { SeoPageKind } from "@/lib/seo-pages/types";

/**
 * An alternatives or guides landing page: the English article, its metadata
 * and its highlighted code samples. The article is English only, so the
 * metadata (English canonical, no hreflang alternates) is the same for every
 * locale and the page data doesn't depend on it.
 */
export const getSeoLandingPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((input: { kind: SeoPageKind; slug: string }) => input)
  .handler(async ({ data: { kind, slug } }) => {
    const page = findSeoPage(kind, slug);
    if (!page) return null;
    const codes = await Promise.all(
      page.sections.map((section) =>
        section.code
          ? highlight(section.code.code, {
              lang: section.code.lang,
              filename: section.code.filename,
            })
          : null,
      ),
    );
    return { kind, page, codes, metadata: seoPageMetadata(kind, page) };
  });

export async function loadSeoLandingPage(input: { kind: SeoPageKind; slug: string }) {
  const data = await getSeoLandingPage({ data: input });
  if (!data) throw notFound();
  return data;
}
