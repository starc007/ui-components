import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SeoPage } from "@/components/app/docs/seo-page";
import { routing } from "@/i18n/routing";
import { findSeoPage, seoPageMetadata, seoPages } from "@/lib/seo-pages";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return seoPages("guides").map((page) => ({ slug: page.slug }));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

// The article is English only, so its metadata (English canonical, no
// hreflang alternates) is the same for every locale.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findSeoPage("guides", (await params).slug);
  return page ? seoPageMetadata("guides", page) : {};
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const page = findSeoPage("guides", slug);
  if (!page || !hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <SeoPage kind="guides" page={page} />;
}
