import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoPage } from "@/components/app/docs/seo-page";
import { findSeoPage, seoPageMetadata, seoPages } from "@/lib/seo-pages";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return seoPages("alternatives").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = findSeoPage("alternatives", (await params).slug);
  return page ? seoPageMetadata("alternatives", page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = findSeoPage("alternatives", (await params).slug);
  if (!page) notFound();
  return <SeoPage kind="alternatives" page={page} />;
}
