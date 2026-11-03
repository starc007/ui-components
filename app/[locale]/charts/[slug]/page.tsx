import ComponentPage, { generateMetadata as componentMetadata } from "@/app/[locale]/components/[category]/[slug]/page";
import { findCategory } from "@/lib/registry";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return findCategory("charts")?.components.map(({ slug }) => ({ slug })) ?? [];
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  return componentMetadata({ params: Promise.resolve({ locale, category: "charts", slug }) });
}

export default async function ChartPage({ params }: Props) {
  const { locale, slug } = await params;
  return <ComponentPage params={Promise.resolve({ locale, category: "charts", slug })} />;
}
