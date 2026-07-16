import type { ReactElement } from "react";
import { SITE_URL } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

const FG = "#17151f";
const MUTED = "rgba(23,21,31,0.66)";
const LOGO_SRC = `${SITE_URL}/beui-mark.png`;

export type OgVariant = "home" | "category" | "component";

type OgOptions = {
  title?: string;
  description?: string;
  label?: string;
  command?: string;
  variant?: OgVariant;
  backgroundSrc?: string;
  logoSrc?: string;
};

function titleSize(title: string) {
  if (title.length <= 12) return 108;
  if (title.length <= 22) return 94;
  if (title.length <= 34) return 82;
  return 70;
}

// Shared Satori-safe OG canvas for the homepage and dynamic social cards.
// The shader is exported to a static image so edge rendering stays deterministic.
export function ogImage({
  title = "The motion toolkit for React & Next.js",
  description = "Free, open-source motion components with the source included.",
  label = "Motion components",
  command = "npx shadcn add @beui/...",
  variant = "home",
  backgroundSrc = `${SITE_URL}/og/grainient-${variant}.jpg`,
  logoSrc = LOGO_SRC,
}: OgOptions = {}): ReactElement {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "54px 62px",
        color: FG,
        fontFamily: "Geist",
        background: "#f3f0eb",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: Satori OG render, not the DOM. */}
      <img
        src={backgroundSrc}
        width={OG_SIZE.width}
        height={OG_SIZE.height}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          objectFit: "cover",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* biome-ignore lint/performance/noImgElement: Satori OG render, not the DOM. */}
          <img
            src={logoSrc}
            width={48}
            height={48}
            style={{ borderRadius: 13 }}
            alt=""
          />
          <span
            style={{
              display: "flex",
              fontFamily: "Geist",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.04em",
            }}
          >
            beui
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid rgba(23,21,31,0.14)",
            background: "rgba(255,255,255,0.3)",
            fontFamily: "Geist Mono",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Geist",
            fontSize: titleSize(title),
            fontWeight: 500,
            letterSpacing: "-0.072em",
            lineHeight: 0.9,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 780,
            fontSize: 25,
            lineHeight: 1.28,
            color: MUTED,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", fontSize: 20 }}>React · Next.js · Tailwind</span>
        <span
          style={{
            display: "flex",
            padding: "13px 19px",
            borderRadius: 999,
            background: FG,
            color: "#fffdf8",
            fontFamily: "Geist Mono",
            fontSize: command.length > 40 ? 13 : 16,
            fontWeight: 500,
          }}
        >
          {command}
        </span>
      </div>
    </div>
  );
}
