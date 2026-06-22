"use client";

import { Marquee } from "@/components/motion/marquee";

const logos = ["Vercel", "Linear", "Stripe", "Figma", "GitHub", "Notion", "Loom", "Raycast"];

export function MarqueePreview() {
  return (
    <div className="w-full">
      <Marquee speed={25}>
        {logos.map((l) => (
          <div
            key={l}
            className="mx-4 flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground"
          >
            {l}
          </div>
        ))}
      </Marquee>
    </div>
  );
}
