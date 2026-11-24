"use client";

import { Dithering } from "@paper-design/shaders-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_OUT } from "@/lib/ease";

/**
 * A CSS colour token as `rgb()`. The shader only reads hex, rgb and hsl, and
 * the theme writes oklch, so the browser converts it by painting one pixel.
 */
function resolveToken(token: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!value || !context) return null;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function readInk() {
  return {
    color: resolveToken("--primary"),
    dark: document.documentElement.classList.contains("dark"),
  };
}

/**
 * A slow, pixel-dithered warp in the theme's primary colour behind the footer
 * wordmark, on a clear background so the footer's surface shows between the
 * dots. It fades in over 1s and fades out toward the links above it. Reduced
 * motion holds it still. Loaded on its own so pages only fetch the shader
 * once the footer is near.
 */
export function FooterShader() {
  const reduce = useReducedMotion();
  const [ink, setInk] = useState<ReturnType<typeof readInk> | null>(null);

  // Re-read the colour when <html> actually changes theme. next-themes swaps
  // the class after its own render, so its `resolvedTheme` arrives before the
  // new tokens do and would pick up the old theme's colour.
  useEffect(() => {
    setInk(readInk());
    const observer = new MutationObserver(() => setInk(readInk()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => observer.disconnect();
  }, []);

  if (!ink?.color) return null;

  return (
    <motion.div
      className="absolute inset-0 [mask-image:linear-gradient(to_top,black_30%,transparent)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: ink.dark ? 0.22 : 0.18 }}
      transition={{ duration: reduce ? 0 : 1, ease: EASE_OUT }}
    >
      <Dithering
        key={ink.color}
        colorBack="#00000000"
        colorFront={ink.color}
        shape="warp"
        type="4x4"
        size={3}
        scale={0.8}
        speed={reduce ? 0 : 0.25}
        className="h-full w-full"
      />
    </motion.div>
  );
}
