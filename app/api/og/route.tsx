import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og-assets";
import { getOgFonts } from "@/lib/og-fonts";
import { allComponents, findCategory } from "@/lib/registry";
import { OG_SIZE, ogImage } from "@/lib/og";
import { clampText } from "@/lib/seo";

// The card art has room for roughly this much body text before it overflows.
const OG_DESCRIPTION_LIMIT = 120;

const PAGE_CARDS = {
  openui: {
    title: "OpenUI + beUI",
    description:
      "Register animated React components, generate OpenUI Lang, and render an interactive UI stream.",
    label: "Integration guide",
    command: "beui.dev/docs/openui",
  },
} as const;

export const runtime = "edge";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const componentSlug = searchParams.get("component");
  const categorySlug = searchParams.get("category");
  const pageSlug = searchParams.get("page");
  const component = componentSlug
    ? allComponents().find((item) => item.slug === componentSlug)
    : undefined;
  const category =
    component?.category ?? (categorySlug ? findCategory(categorySlug) : undefined);
  const page =
    pageSlug && pageSlug in PAGE_CARDS
      ? PAGE_CARDS[pageSlug as keyof typeof PAGE_CARDS]
      : undefined;
  const title =
    component?.name ??
    category?.name ??
    page?.title ??
    "Animated components for React and Next.js";
  const description = clampText(
    component?.description ??
      category?.description ??
      page?.description ??
      "Free, open-source React components built with Motion and Tailwind CSS.",
    OG_DESCRIPTION_LIMIT,
  );
  const label = component
    ? "Component"
    : category
      ? category.name
      : page?.label ?? "Motion components";
  const command = component
    ? `npx shadcn add @beui/${component.slug}`
    : page?.command ?? "npx shadcn add @beui/...";
  const variant = component
    ? "component"
    : category || page
      ? "category"
      : "home";
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
