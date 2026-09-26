import type { ReactElement } from "react";
import { SITE_URL } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

type OgOptions = {
  title?: string;
  description?: string;
  label?: string;
  command?: string;
  backgroundSrc?: string;
  logoSrc?: string;
  homepage?: boolean;
};

// Keep text live so registry pages share the artwork without baking in titles.
export function ogImage({
  title = "beui",
  description = "Animated components. Ready to make yours.",
  label = "Motion components",
  command,
  backgroundSrc = `${SITE_URL}/og/component-gallery.png`,
  logoSrc = `${SITE_URL}/beui-mark.png`,
  homepage = true,
}: OgOptions = {}): ReactElement {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "#f7f7f9", color: "#101116", fontFamily: "Manrope" }}>
      {/* biome-ignore lint/performance/noImgElement: Satori renders this static artwork into the OG PNG. */}
      <img src={backgroundSrc} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
      {/* biome-ignore lint/performance/noImgElement: Satori renders the brand asset into the OG PNG. */}
      <img src={logoSrc} alt="" width={52} height={52} style={{ position: "absolute", left: 72, top: 56, borderRadius: 14 }} />
      <div style={{ position: "absolute", left: 72, bottom: 76, width: 580, display: "flex", flexDirection: "column", gap: homepage ? 14 : 18 }}>
        {!homepage && <div style={{ display: "flex", fontSize: 19, color: "#636777" }}>beui / {label}</div>}
        <div style={{ display: "flex", fontSize: homepage ? 76 : title.length > 28 ? 46 : 58, fontWeight: 500, letterSpacing: "-0.05em", lineHeight: 1.08 }}>{title}</div>
        <div style={{ display: "flex", fontSize: homepage ? 25 : 23, lineHeight: 1.4, letterSpacing: "-0.025em", color: homepage ? "#171820" : "#636777" }}>{description}</div>
        {!homepage && command && <div style={{ display: "flex", fontSize: 15, color: "#636777", marginTop: 6 }}>{command}</div>}
      </div>
    </div>
  );
}
