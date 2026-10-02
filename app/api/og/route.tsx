import { ImageResponse } from "next/og";
import { after } from "next/server";
import { getOgAssets } from "@/lib/og-assets";
import { getOgFonts } from "@/lib/og-fonts";
import { allComponents, findCategory } from "@/lib/registry";
import { OG_SIZE, ogImage } from "@/lib/og";
import { clampText } from "@/lib/seo";

// The card art has room for roughly this much body text before it overflows.
const OG_DESCRIPTION_LIMIT = 120;
const OG_CACHE_TTL = 3600;

const PAGE_CARDS = {
  openui: {
    title: "OpenUI + beUI",
    description:
      "Register animated React components, generate OpenUI Lang, and render an interactive UI stream.",
    label: "Integration guide",
    command: "beui.dev/docs/openui",
  },
} as const;

export const runtime = "nodejs";

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
    pageSlug && Object.hasOwn(PAGE_CARDS, pageSlug)
      ? PAGE_CARDS[pageSlug as keyof typeof PAGE_CARDS]
      : undefined;

  // Cache the resolved card, not arbitrary query strings. Unknown slugs and
  // tracking parameters must not cause another render of the same image.
  const cacheUrl = new URL("/api/og", requestUrl.origin);
  if (component) cacheUrl.searchParams.set("component", component.slug);
  else if (category) cacheUrl.searchParams.set("category", category.slug);
  if (page && pageSlug) cacheUrl.searchParams.set("page", pageSlug);
  const cacheKey = new Request(cacheUrl);
  const cache = typeof caches !== "undefined"
    ? (caches as CacheStorage & { default?: Cache }).default
    : undefined;
  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    } catch (error) {
      console.error("OG image cache read failed", error);
    }
  }

  const homepage = !component && !category && !page;
  const title =
    component?.name ??
    category?.name ??
    page?.title ??
    "beui";
  const description = clampText(
    component?.description ??
      category?.description ??
      page?.description ??
      "Animated components. Ready to make yours.",
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
  const origin = requestUrl.origin;
  const [fonts, assets] = await Promise.all([
    getOgFonts(origin),
    getOgAssets(origin),
  ]);

  const response = new ImageResponse(
    ogImage({ title, description, label, command, homepage, ...assets }),
    {
      ...OG_SIZE,
      fonts,
      headers: { "Cache-Control": `public, max-age=${OG_CACHE_TTL}` },
    },
  );

  if (cache) {
    const cachedResponse = response.clone();
    after(async () => {
      try {
        await cache.put(cacheKey, cachedResponse);
      } catch (error) {
        console.error("OG image cache write failed", error);
      }
    });
  }
  return response;
}
