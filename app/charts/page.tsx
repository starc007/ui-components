import CategoryPage, { generateMetadata as categoryMetadata } from "@/app/components/[category]/page";

export function generateMetadata() {
  return categoryMetadata({ params: Promise.resolve({ category: "charts" }) });
}

export default function ChartsPage() {
  return <CategoryPage params={Promise.resolve({ category: "charts" })} />;
}
