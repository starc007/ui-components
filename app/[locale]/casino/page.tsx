import CategoryPage, { generateMetadata as categoryMetadata } from "@/app/[locale]/components/[category]/page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return categoryMetadata({ params: Promise.resolve({ locale, category: "casino" }) });
}

export default async function CasinoPage({ params }: Props) {
  const { locale } = await params;
  return <CategoryPage params={Promise.resolve({ locale, category: "casino" })} />;
}
