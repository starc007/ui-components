"use client";

import { useRef } from "react";

import { Parallax } from "@/components/motion/parallax";

// On a real page <Parallax> tracks the viewport. Here it's scoped to the box
// via the container prop. Scroll inside the box: the background image drifts
// against the scroll, the label and avatar drift with it at different speeds.
export function ParallaxPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] w-full max-w-2xl overflow-y-auto scrollbar-hide rounded-2xl border border-border bg-card"
    >
      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        Scroll down ↓
      </div>

      <div className="relative h-96 overflow-hidden">
        <Parallax
          container={containerRef}
          speed={-0.6}
          className="absolute inset-x-0 -top-1/4 h-[150%]"
        >
          {/* biome-ignore lint/performance/noImgElement: plain img keeps the copy-paste preview portable (no next/image host config). */}
          <img
            src="https://picsum.photos/seed/beui-parallax/800/600"
            alt=""
            className="size-full object-cover"
          />
        </Parallax>

        <Parallax
          container={containerRef}
          speed={0.5}
          className="absolute inset-0 grid place-items-center"
        >
          <span className="rounded-full bg-background/85 px-5 py-2 text-base font-medium text-foreground backdrop-blur">
            Parallax
          </span>
        </Parallax>

        <Parallax
          container={containerRef}
          speed={0.9}
          className="absolute bottom-4 right-4"
        >
          {/* biome-ignore lint/performance/noImgElement: plain img keeps the copy-paste preview portable (no next/image host config). */}
          <img
            src="https://picsum.photos/seed/beui-avatar/120/120"
            alt=""
            className="size-12 rounded-full border-2 border-background object-cover shadow-lg"
          />
        </Parallax>
      </div>

      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        ↑ Scroll up
      </div>
    </div>
  );
}
