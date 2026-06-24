"use client";

import { useRef } from "react";

import { ScrollReveal } from "@/components/motion/scroll-reveal";

// On a page <ScrollReveal> tracks the viewport. Here root points at the box so
// each card reveals as it scrolls into the contained view.
const CARDS = ["Spring slide", "Blur in", "Staggered by delay", "Reveal once"];

export function ScrollRevealPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full max-w-lg overflow-y-auto scrollbar-hide rounded-2xl border border-border bg-card"
    >
      <div className="flex flex-col gap-16 p-6">
        <div className="text-center text-sm text-muted-foreground">
          Scroll ↓
        </div>
        {CARDS.map((label, i) => (
          <ScrollReveal
            key={label}
            root={containerRef}
            once={false}
            delay={i * 0.05}
            className="rounded-xl border border-border bg-muted/50 px-4 py-16 text-center text-base font-medium text-foreground"
          >
            {label}
          </ScrollReveal>
        ))}
        <div className="text-center text-sm text-muted-foreground">End</div>
      </div>
    </div>
  );
}
