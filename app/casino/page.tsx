import CategoryPage, { generateMetadata as categoryMetadata } from "@/app/components/[category]/page";

export function generateMetadata() {
  return categoryMetadata({ params: Promise.resolve({ category: "casino" }) });
}

export default function CasinoPage() {
  return <CategoryPage params={Promise.resolve({ category: "casino" })} />;
}
