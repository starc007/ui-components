"use client";

import { ArrowUp } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

// The real <SmoothScroll> is a page-level provider (root mode) shown in the
// Usage tab. A boxed preview can't hijack the page, so this demos the feel:
// a contained scroller with a spring-smoothed progress bar and scroll-to-top,
// the same scroll-driven UI <SmoothScroll> + useSmoothScroll unlock.
const SECTIONS = Array.from({ length: 16 }, (_, i) => i + 1);

export function SmoothScrollPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.6,
  });

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
      <motion.div
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-foreground"
        style={{ scaleX: progress }}
      />
      <div ref={ref} className="h-64 overflow-y-auto scrollbar-hide">
        <div className="space-y-3 p-4">
          {SECTIONS.map((n) => (
            <div
              key={`section-${n}`}
              className="rounded-lg bg-muted/60 px-3 py-4 text-sm text-muted-foreground"
            >
              Section {n}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => ref.current?.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute bottom-3 right-3 z-10 grid size-9 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
        aria-label="Scroll to top"
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}
