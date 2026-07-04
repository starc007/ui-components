"use client";

import { type ComponentType, useState } from "react";
import { CylinderCarousel } from "@/components/motion/cylinder-carousel";
import {
  ShaderBackground,
  type ShaderBackgroundVariant,
} from "@/components/motion/shader-background";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

// Each variant has its own prop shape; the slides only spread their own preset.
const Background = ShaderBackground as ComponentType<
  { variant: ShaderBackgroundVariant; className?: string } & Record<
    string,
    unknown
  >
>;

const SLIDES: { variant: ShaderBackgroundVariant; props: Record<string, unknown> }[] = [
  {
    variant: "dithering",
    props: { colorBack: "#1a1030", colorFront: "#b98cff", speed: 0.3 },
  },
  {
    variant: "metaballs",
    props: { colors: ["#e8e8ef", "#8a8a9a", "#1a1a22"], colorBack: "#c9b9a8", speed: 0.4 },
  },
  {
    variant: "warp",
    props: { colors: ["#c8ff00", "#3a5a00", "#c8ff00", "#88bb00"], speed: 0.4 },
  },
  {
    variant: "god-rays",
    props: { colors: ["#6a7bff", "#00114d"], colorBack: "#000000", speed: 0.5 },
  },
  {
    variant: "swirl",
    props: { colorBack: "#1a0000", colors: ["#ffd1a8", "#ff6a3d", "#b31a57"], speed: 0.3 },
  },
  {
    variant: "mesh-gradient",
    props: { colors: ["#e0eaff", "#241d9a", "#f75092", "#9f50d3"], speed: 0.3 },
  },
  {
    variant: "voronoi",
    props: { colors: ["#ff8247", "#ffe53d"], speed: 0.3 },
  },
  {
    variant: "neuro-noise",
    props: { colorFront: "#ffffff", colorMid: "#47a6ff", colorBack: "#000000", speed: 0.4 },
  },
];

export function CylinderCarouselPreview() {
  const [variant, setVariant] = useState<"concave" | "convex">("concave");

  return (
    <div className="flex w-full flex-col items-center gap-4 p-6">
      <Tabs
        value={variant}
        onValueChange={(v) => setVariant(v as "concave" | "convex")}
        variant="segment"
      >
        <TabsList>
          <TabsTrigger value="concave">Concave</TabsTrigger>
          <TabsTrigger value="convex">Convex</TabsTrigger>
        </TabsList>
      </Tabs>
      {/* clip-path (not overflow) so the rounded corner also clips the GPU-composited balls */}
      <div className="w-full rounded-3xl border border-border/60 bg-muted/20 py-6 [clip-path:inset(0_round_1.5rem)]">
        <CylinderCarousel
          variant={variant}
          itemSize={230}
          height={310}
          className="w-full"
        >
          {SLIDES.map((slide) => (
            <div
              key={slide.variant}
              className="h-full w-full overflow-hidden rounded-full border border-border/40"
            >
              <Background
                variant={slide.variant}
                className="h-full w-full"
                {...slide.props}
              />
            </div>
          ))}
        </CylinderCarousel>
      </div>
      <p className="text-xs text-muted-foreground">
        Drag, scroll or use arrow keys to roll
      </p>
    </div>
  );
}
