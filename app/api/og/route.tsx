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
    "Simple components for your app.";
  const label = component ? `${component.category.name} component` : "UI components";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#111111",
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.07), transparent 34%), linear-gradient(180deg, #171717 0%, #111111 62%)",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "12px 18px",
              background: "rgba(255,255,255,0.04)",
              fontSize: 23,
              color: "#a3a3a3",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: "#fafafa",
                display: "flex",
              }}
            />
            <span style={{ fontWeight: 700, color: "#fafafa" }}>beUI</span>
            <span>v2</span>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#a3a3a3" }}>
            {label}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              width: 900,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: title.length > 22 ? 82 : 104,
                fontWeight: 760,
                letterSpacing: "-0.04em",
                lineHeight: 0.94,
                color: "#fafafa",
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 30,
                color: "#a3a3a3",
                lineHeight: 1.25,
                display: "flex",
                justifyContent: "center",
                maxWidth: 760,
                textAlign: "center",
              }}
            >
              {description}
            </div>
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
          <span>Browse the library</span>
        </div>
      </div>
    ),
    size,
  );
}
