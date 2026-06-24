"use client";

import { ArrowUp } from "lucide-react";

import { SmoothScroll, useSmoothScroll } from "@/components/motion/smooth-scroll";

// In production <SmoothScroll> wraps the page (root). Here it runs in contained
// mode (root={false}) so the box itself smooth-scrolls — the same engine, and
// the button uses the useSmoothScroll() hook to glide back to the top.
const SECTIONS = Array.from({ length: 16 }, (_, i) => i + 1);

function ScrollTopButton() {
  const { scrollTo } = useSmoothScroll();
  return (
    <button
      type="button"
      onClick={() => scrollTo(0)}
      className="sticky bottom-3 left-[calc(100%-3rem)] z-10 grid size-9 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

export function SmoothScrollPreview() {
  return (
    <SmoothScroll
      root={false}
      className="h-64 w-full max-w-lg overflow-y-auto scrollbar-hide rounded-2xl border border-border bg-card"
    >
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
      <ScrollTopButton />
    </SmoothScroll>
  );
}
