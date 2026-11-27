import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { getTranslations } from "@/i18n/server";
import { pageMetadata } from "@/lib/head";
import { highlight } from "@/lib/highlight";
import { ogImagePath } from "@/lib/og-paths";
import { findSeoPage, seoPageMetadata } from "@/lib/seo-pages";
import type { SeoPageKind } from "@/lib/seo-pages/types";

/**
 * An alternatives or guides landing page: the English article, its metadata
 * and its highlighted code samples.
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

/** Metadata for the /guides and /alternatives lists. */
export const getSeoIndexPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((kind: SeoPageKind) => kind)
  .handler(async ({ data: kind }) => {
    const t = getTranslations(`Native.seoIndex.${kind}`);
    const path = `/${kind}`;
    const title = t("title");
    const description = t("description");
    const metadata = pageMetadata({
      path,
      title,
      description,
      image: ogImagePath("page", kind),
      imageAlt: title,
      types: { "text/markdown": `${path}.md` },
    });
    return { metadata };
  });

export async function loadSeoLandingPage(input: { kind: SeoPageKind; slug: string }) {
  const data = await getSeoLandingPage({ data: input });
  if (!data) throw notFound();
  return data;
}
