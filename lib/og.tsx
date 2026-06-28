import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

const BG = "#0a0a0a";
const FG = "#fafafa";
const MUTED = "#8a8a8a";
const HAIRLINE = "rgba(255,255,255,0.12)";
const LOGO_SRC = "https://beui.dev/beui-mark.png";

type OgOptions = {
  title?: string;
  description?: string;
  label?: string;
  command?: string;
};

// Shared OG canvas for the homepage file route and the dynamic /api/og route.
// Monochrome and text-led: real logo mark, no accent color, no gradients.
// Satori-safe styles only (flexbox; every multi-child node sets display:flex).
export function ogImage({
  title = "beUI",
  description = "The motion toolkit for React & Next.js. Built on Framer Motion and Tailwind.",
  label = "Motion components",
  command = "npx shadcn add @beui/...",
}: OgOptions = {}): ReactElement {
  const big = title.length > 18 ? 84 : 108;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: BG,
        color: FG,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* top bar: logo + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* biome-ignore lint/performance/noImgElement: satori OG render, not the DOM. */}
          <img
            src={LOGO_SRC}
            width={56}
            height={56}
            style={{ borderRadius: 14 }}
            alt=""
          />
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            beui
          </span>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: MUTED }}>{label}</div>
      </div>

      {/* title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 960 }}>
        <div
          style={{
            display: "flex",
            fontSize: big,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            lineHeight: 0.98,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            lineHeight: 1.3,
            color: MUTED,
            maxWidth: 760,
          }}
        >
          {description}
        </div>
      </div>

      {/* footer */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", height: 1, background: HAIRLINE }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
          }}
        >
          <span style={{ display: "flex", fontWeight: 600 }}>beui.dev</span>
          <span style={{ display: "flex", color: MUTED }}>{command}</span>
        </div>
      </div>
    </div>
  );
}
