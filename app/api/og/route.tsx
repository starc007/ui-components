import { ImageResponse } from "next/og";
import { allComponents, findCategory } from "@/lib/registry";
import { OG_SIZE, ogImage } from "@/lib/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const componentSlug = searchParams.get("component");
  const categorySlug = searchParams.get("category");
  const component = componentSlug
    ? allComponents().find((item) => item.slug === componentSlug)
    : undefined;
  const category =
    component?.category ?? (categorySlug ? findCategory(categorySlug) : undefined);
  const title = component?.name ?? (category ? `${category.name} components` : "beUI");
  const description =
    component?.description ??
    category?.description ??
    "Production-ready motion components for React. Copy the source, own the code.";
  const label = component ? `${component.category.name} component` : "Motion components";

  return new ImageResponse(ogImage({ title, description, label }), OG_SIZE);
}
