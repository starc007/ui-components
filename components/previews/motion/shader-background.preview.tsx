"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import {
  ShaderBackground,
  type ShaderBackgroundProps,
  type ShaderBackgroundVariant,
} from "@/components/motion/shader-background";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const VARIANTS: {
  id: string;
  value: ShaderBackgroundVariant;
  label: string;
  props: Record<string, unknown>;
}[] = [
  {
    id: "mesh-gradient",
    value: "mesh-gradient",
    label: "Mesh",
    props: {
      colors: ["#e0eaff", "#241d9a", "#f75092", "#9f50d3"],
      distortion: 0.8,
      swirl: 0.3,
      speed: 0.4,
    },
  },
  {
    id: "grain-gradient",
    value: "grain-gradient",
    label: "Grain",
    props: {
      colors: ["#7300ff", "#eba8ff", "#00bfff", "#2a00ff"],
      colorBack: "#000000",
      softness: 0.6,
      speed: 0.5,
    },
  },
  {
    id: "grain-sunset",
    value: "grain-gradient",
    label: "Grain — Sunset",
    props: {
      colors: ["#ff7a00", "#ff2e93", "#ffce54", "#8a2be2"],
      colorBack: "#1a0500",
      softness: 0.7,
      speed: 0.4,
    },
  },
  {
    id: "grain-pastel",
    value: "grain-gradient",
    label: "Grain — Pastel",
    props: {
      colors: ["#ffd6e8", "#c9e4ff", "#fff3c4", "#d9c9ff"],
      colorBack: "#ffffff",
      softness: 0.85,
      speed: 0.3,
    },
  },
  {
    id: "mesh-aurora",
    value: "mesh-gradient",
    label: "Mesh — Aurora",
    props: {
      colors: ["#00ffb2", "#0072ff", "#a200ff", "#001a2c"],
      distortion: 0.6,
      swirl: 0.5,
      speed: 0.3,
    },
  },
  {
    id: "mesh-citrus",
    value: "mesh-gradient",
    label: "Mesh — Citrus",
    props: {
      colors: ["#fff200", "#ff8a00", "#ff3d00", "#ffe08a"],
      distortion: 0.7,
      swirl: 0.4,
      speed: 0.5,
    },
  },
  {
    id: "warp",
    value: "warp",
    label: "Warp",
    props: {
      colors: ["#121212", "#9470ff", "#121212", "#8838ff"],
      speed: 0.4,
    },
  },
  {
    id: "waves",
    value: "waves",
    label: "Waves",
    props: { colorFront: "#ffbb00", colorBack: "#000000" },
  },
  {
    id: "voronoi",
    value: "voronoi",
    label: "Voronoi",
    props: { colors: ["#ff8247", "#ffe53d"], speed: 0.3 },
  },
  {
    id: "swirl",
    value: "swirl",
    label: "Swirl",
    props: {
      colorBack: "#180018",
      colors: ["#ffd1d1", "#ff8a8a", "#660000"],
      speed: 0.2,
    },
  },
  {
    id: "dot-orbit",
    value: "dot-orbit",
    label: "Orbit",
    props: {
      colors: ["#ffc96b", "#ff6200", "#ff2f00"],
      colorBack: "#000000",
      speed: 0.6,
    },
  },
  {
    id: "dot-grid",
    value: "dot-grid",
    label: "Grid",
    props: {
      colorBack: "#000000",
      colorFill: "#ffffff",
      colorStroke: "#ffaa00",
    },
  },
  {
    id: "smoke-ring",
    value: "smoke-ring",
    label: "Smoke",
    props: { colorBack: "#000000", colors: ["#ffffff"], speed: 0.3 },
  },
  {
    id: "static-radial-gradient",
    value: "static-radial-gradient",
    label: "Radial",
    props: { colorBack: "#000000", colors: ["#00bbff", "#00ffe1", "#ffffff"] },
  },
  {
    id: "neuro-noise",
    value: "neuro-noise",
    label: "Neuro",
    props: {
      colorFront: "#ffffff",
      colorMid: "#47a6ff",
      colorBack: "#000000",
      speed: 0.4,
    },
  },
  {
    id: "water",
    value: "water",
    label: "Water",
    props: { colorBack: "#909090", colorHighlight: "#ffffff", speed: 0.4 },
  },
  {
    id: "metaballs",
    value: "metaballs",
    label: "Metaballs",
    props: {
      colors: ["#ff5cf4", "#4d9eff", "#000000"],
      colorBack: "#000000",
      speed: 0.5,
    },
  },
  {
    id: "god-rays",
    value: "god-rays",
    label: "Rays",
    props: {
      colors: ["#ffcc66", "#ff6a00"],
      colorBack: "#000000",
      speed: 0.4,
    },
  },
  {
    id: "spiral",
    value: "spiral",
    label: "Spiral",
    props: { colors: ["#7a5cff", "#ff5ca6", "#000000"], speed: 0.4 },
  },
  {
    id: "dithering",
    value: "dithering",
    label: "Dither",
    props: {
      colorBack: "#000000",
      colorFront: "#00ff9d",
      speed: 0.4,
    },
  },
  {
    id: "pulsing-border",
    value: "pulsing-border",
    label: "Pulse",
    props: {
      colors: ["#00e5ff", "#7000ff", "#ff00c8"],
      colorBack: "#000000",
      speed: 0.5,
    },
  },
  {
    id: "color-panels",
    value: "color-panels",
    label: "Panels",
    props: { colors: ["#ff3d68", "#ffb800", "#3d7aff", "#00ffb2"], speed: 0.3 },
  },
  {
    id: "static-mesh-gradient",
    value: "static-mesh-gradient",
    label: "Static Mesh",
    props: { colors: ["#ff8a3d", "#ff3d9a", "#3d5aff", "#0a0a0a"] },
  },
  {
    id: "static-mesh-dusk",
    value: "static-mesh-gradient",
    label: "Static Mesh — Dusk",
    props: { colors: ["#2b1055", "#7597de", "#f6a1c8", "#0d0221"] },
  },
  {
    id: "radial-ember",
    value: "static-radial-gradient",
    label: "Radial — Ember",
    props: { colorBack: "#0a0000", colors: ["#ff5100", "#ffce00", "#4a0000"] },
  },
  {
    id: "simplex-noise",
    value: "simplex-noise",
    label: "Simplex",
    props: { colors: ["#ff6ec7", "#6ec7ff", "#000000"], speed: 0.4 },
  },
  {
    id: "perlin-noise",
    value: "perlin-noise",
    label: "Perlin",
    props: { colorFront: "#00ffd5", colorBack: "#000000", speed: 0.3 },
  },
];

// Every variant carries a different prop shape; the switcher only ever spreads
// each entry's own preset, so the loose cast here is safe.
const Background = ShaderBackground as ComponentType<
  ShaderBackgroundProps & Record<string, unknown>
>;

export function ShaderBackgroundPreview() {
  const [active, setActive] = useState<string>(VARIANTS[0].id);
  const current = VARIANTS.find((v) => v.id === active) ?? VARIANTS[0];

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 p-6">
      <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-border">
        <Background
          key={current.id}
          variant={current.value}
          className="absolute inset-0"
          {...current.props}
        />
      </div>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex-wrap justify-center gap-2 rounded-2xl">
          {VARIANTS.map((v) => (
            <TabsTrigger
              key={v.id}
              value={v.id}
              className="px-4 py-2 text-sm"
            >
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
