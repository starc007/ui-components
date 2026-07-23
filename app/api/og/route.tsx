import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og-assets";
import { getOgFonts } from "@/lib/og-fonts";
import { allComponents, findCategory } from "@/lib/registry";
import { OG_SIZE, ogImage } from "@/lib/og";
import { clampText } from "@/lib/seo";

// The card art has room for roughly this much body text before it overflows.
const OG_DESCRIPTION_LIMIT = 120;

export const runtime = "edge";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const componentSlug = searchParams.get("component");
  const categorySlug = searchParams.get("category");
  const component = componentSlug
    ? allComponents().find((item) => item.slug === componentSlug)
    : undefined;
  const category =
    component?.category ?? (categorySlug ? findCategory(categorySlug) : undefined);
  const title =
    component?.name ??
    category?.name ??
    "Animated components for React and Next.js";
  const description = clampText(
    component?.description ??
      category?.description ??
      "Free, open-source React components built with Motion and Tailwind CSS.",
    OG_DESCRIPTION_LIMIT,
  );
  const label = component
    ? "Component"
    : category
      ? category.name
      : "Motion components";
  const command = component
    ? `npx shadcn add @beui/${component.slug}`
    : "npx shadcn add @beui/...";
  const variant = component ? "component" : category ? "category" : "home";
  const origin = requestUrl.origin;
  const [fonts, assets] = await Promise.all([
    getOgFonts(origin),
    getOgAssets(variant, origin),
  ]);

  return new ImageResponse(
    ogImage({ title, description, label, command, variant, ...assets }),
    { ...OG_SIZE, fonts },
  );
}
