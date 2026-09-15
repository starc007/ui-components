import ComponentPage, { generateMetadata as componentMetadata } from "@/app/components/[category]/[slug]/page";
import { findCategory } from "@/lib/registry";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return findCategory("charts")?.components.map(({ slug }) => ({ slug })) ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return componentMetadata({ params: Promise.resolve({ category: "charts", slug }) });
}

export default async function ChartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ComponentPage params={Promise.resolve({ category: "charts", slug })} />;
}
