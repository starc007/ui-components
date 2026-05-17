"use client";

import { Hero } from "@/components/blocks/hero";

export function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg)">
      <Hero
        eyebrow="Now in public beta"
        title="Build interfaces that"
        highlight="feel alive."
        description="A production-grade set of React + Tailwind components for shipping fast without giving up on craft."
        primaryCta={{ label: "Get started", href: "#" }}
        secondaryCta={{ label: "View on GitHub", href: "#" }}
      />
    </div>
  );
}
