"use client";

import { useScroll } from "motion/react";
import { useRef } from "react";

import { ScrollProgress } from "@/components/motion/scroll-progress";

// Real usage: drop <ScrollProgress /> anywhere — it reads page scroll via
// useSmoothScroll and pins itself with `fixed`. Here we scope it to a box by
// passing a contained `progress` source and `fixed={false}`.
const SECTIONS = Array.from({ length: 18 }, (_, i) => i + 1);

export function ScrollProgressPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: ref });

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card">
      <ScrollProgress progress={scrollYProgress} fixed={false} height={3} />
      <div className="absolute right-3 top-3 z-10 rounded-full bg-background/70 p-1 backdrop-blur">
        <ScrollProgress variant="circle" progress={scrollYProgress} size={36} />
      </div>
      <div ref={ref} className="h-64 overflow-y-auto scrollbar-hide">
        <div className="space-y-3 p-4">
          {SECTIONS.map((n) => (
            <div
              key={`row-${n}`}
              className="rounded-lg bg-muted/60 px-3 py-4 text-sm text-muted-foreground"
            >
              Section {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
