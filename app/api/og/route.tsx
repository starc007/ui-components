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
    "The motion toolkit for React & Next.js. Built on Framer Motion and Tailwind.";
  const label = component
    ? "Component"
    : category
      ? category.name
      : "Motion components";
  const command = component
    ? `npx shadcn add @beui/${component.slug}`
    : "npx shadcn add @beui/...";

  return new ImageResponse(
    ogImage({ title, description, label, command }),
    OG_SIZE,
  );
}
