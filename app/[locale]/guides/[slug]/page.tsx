import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoPage } from "@/components/app/docs/seo-page";
import { findSeoPage, seoPageMetadata, seoPages } from "@/lib/seo-pages";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return seoPages("guides").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = findSeoPage("guides", (await params).slug);
  return page ? seoPageMetadata("guides", page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = findSeoPage("guides", (await params).slug);
  if (!page) notFound();
  return <SeoPage kind="guides" page={page} />;
}
