import { ImageResponse } from "next/og";
import { allComponents, findCategory } from "@/lib/registry";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const componentSlug = searchParams.get("component");
  const categorySlug = searchParams.get("category");
  const component = componentSlug ? allComponents().find((item) => item.slug === componentSlug) : undefined;
  const category = component?.category ?? (categorySlug ? findCategory(categorySlug) : undefined);
  const title = component?.name ?? (category ? `${category.name} components` : "beUI v2");
  const description =
    component?.description ??
    category?.description ??
    "Bespoke motion components for React, Tailwind v4 and motion.";
  const label = component ? `${component.category.name} component` : "shadcn-compatible registry";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px",
          background: "#151515",
          backgroundImage:
            "radial-gradient(ellipse at 28% 0%, rgba(255,255,255,0.08), transparent 56%), linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "auto, 48px 48px, 48px 48px",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#a0a0a0" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#fafafa",
            }}
          />
          <span style={{ fontWeight: 650, color: "#fafafa" }}>beUI</span>
          <span>v2</span>
          <span style={{ color: "#737373" }}>/</span>
          <span>{label}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 980 }}>
          <div
            style={{
              fontSize: title.length > 22 ? 88 : 104,
              fontWeight: 650,
              letterSpacing: "-0.045em",
              lineHeight: 0.94,
              color: "#fafafa",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#b5b5b5",
              lineHeight: 1.25,
              display: "flex",
              maxWidth: 920,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#a0a0a0",
          }}
        >
          <span>beui.saura3h.xyz</span>
          <span>React 19 · Tailwind 4 · Motion</span>
        </div>
      </div>
    ),
    size,
  );
}
