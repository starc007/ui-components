"use client";

import { TextReveal } from "@/components/motion/text-reveal";
import { TextShimmer } from "@/components/motion/text-shimmer";

export function TextAnimationPreview() {
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center">
      <TextReveal
        as="h2"
        text="Motion in words."
        stagger={0.045}
        blur={6}
        yOffset="18%"
        className="text-balance text-3xl font-semibold tracking-tight text-(--color-fg)"
      />
      <TextShimmer duration={1.8} className="text-sm">
        Loading with shimmer
      </TextShimmer>
    </div>
  );
}
