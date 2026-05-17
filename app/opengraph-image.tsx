import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "beUI v2 — Bespoke motion components for React";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#151515",
          backgroundImage:
            "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "auto, 48px 48px, 48px 48px",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: "#a0a0a0" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#fafafa",
            }}
          />
          <span style={{ fontWeight: 600, color: "#fafafa" }}>beUI</span>
          <span>·</span>
          <span>v2</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 600,
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
              color: "#fafafa",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Motion components</span>
            <span>that don&apos;t suck.</span>
          </div>
          <div style={{ fontSize: 30, color: "#a0a0a0", lineHeight: 1.3, display: "flex" }}>
            Bespoke for React. No Radix, no shadcn. Just motion.
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
          <span>Next 15 · React 19 · Tailwind 4</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
