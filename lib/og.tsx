import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

const ACCENT = "#22d3ee";
const BG = "#0c0c0c";
const FG = "#fafafa";
const MUTED = "#8f8f8f";

type OgOptions = {
  title?: string;
  description?: string;
  label?: string;
  command?: string;
};

// Shared OG canvas for the homepage file route and the dynamic /api/og route,
// so every link preview gets the same premium card. Satori-safe styles only
// (flexbox + gradients; every multi-child node sets display:flex).
export function ogImage({
  title = "beUI",
  description = "Production-ready motion components for React. Copy the source, own the code.",
  label = "Motion components",
  command = "npx shadcn add @beui/...",
}: OgOptions = {}): ReactElement {
  const big = title.length > 18 ? 76 : 96;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: BG,
        backgroundImage:
          "radial-gradient(900px 520px at 100% -10%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(680px 560px at -10% 110%, rgba(34,211,238,0.07), transparent 55%)",
        color: FG,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(140deg, ${ACCENT}, #0891b2)`,
            }}
          />
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
            beui
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            padding: "10px 18px",
            fontSize: 22,
            color: MUTED,
          }}
        >
          {label}
        </div>
      </div>

      {/* body: title/desc left, showcase panel right */}
      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
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
              fontSize: 28,
              lineHeight: 1.3,
              color: MUTED,
              maxWidth: 520,
            }}
          >
            {description}
          </div>
        </div>

        {/* faux component showcase */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            width: 360,
            padding: 28,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {/* button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              borderRadius: 999,
              background: ACCENT,
              color: "#06222a",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Get started
          </div>
          {/* switch row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", fontSize: 22, color: MUTED }}>Toggle</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: 64,
                height: 36,
                borderRadius: 999,
                background: ACCENT,
                padding: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "#ffffff",
                }}
              />
            </div>
          </div>
          {/* slider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              padding: "0 14px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: 14,
                width: 150,
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
              }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: 150,
                width: 6,
                height: 22,
                borderRadius: 4,
                background: ACCENT,
              }}
            />
          </div>
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          color: MUTED,
        }}
      >
        <span style={{ display: "flex", color: FG, fontWeight: 600 }}>beui.dev</span>
        <span style={{ display: "flex" }}>{command}</span>
      </div>
    </div>
  );
}
