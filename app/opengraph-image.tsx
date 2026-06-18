import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "beUI v2 UI components";
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
            beui.dev
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 26,
              width: 900,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 104,
                fontWeight: 760,
                letterSpacing: "-0.045em",
                lineHeight: 0.94,
                color: "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <span>UI</span>
              <span>components</span>
              <span>with motion.</span>
            </div>
            <div
              style={{
                fontSize: 31,
                color: "#a3a3a3",
                lineHeight: 1.25,
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              Simple components for your app.
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
          <span>Browse the library</span>
          <span>Simple motion for common UI.</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
