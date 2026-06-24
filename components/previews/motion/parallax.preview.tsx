"use client";

import { useRef } from "react";

import { Parallax } from "@/components/motion/parallax";

// On a real page <Parallax> tracks the viewport. Here it's scoped to the box
// via the container prop so the layers drift as you scroll inside it.
export function ParallaxPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full max-w-lg overflow-y-auto scrollbar-hide rounded-2xl border border-border bg-card"
    >
      <div className="relative flex h-[150%] flex-col items-center justify-center gap-6 p-6">
        <Parallax container={containerRef} speed={-0.4}>
          <div className="grid size-24 place-items-center rounded-2xl bg-muted text-sm text-muted-foreground">
            back
          </div>
        </Parallax>
        <Parallax container={containerRef} speed={0.25}>
          <div className="grid size-20 place-items-center rounded-2xl bg-foreground text-sm text-background">
            front
          </div>
        </Parallax>
        <Parallax container={containerRef} speed={0.6} axis="x">
          <div className="grid h-12 w-32 place-items-center rounded-full border border-border text-sm text-muted-foreground">
            drift x
          </div>
        </Parallax>
      </div>
    </div>
  );
}
