import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { getTranslations } from "@/i18n/server";
import type { Metadata } from "@/lib/head";
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
    const image = ogImagePath("page", kind);
    const metadata: Metadata = {
      title,
      description,
      alternates: { canonical: path },
      openGraph: {
        title: `${title} · beUI`,
        description,
        url: path,
        type: "website",
        siteName: "beUI",
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: "summary_large_image", title: `${title} · beUI`, description, images: [image] },
    };
    return { metadata };
  });

export async function loadSeoLandingPage(input: { kind: SeoPageKind; slug: string }) {
  const data = await getSeoLandingPage({ data: input });
  if (!data) throw notFound();
  return data;
}
