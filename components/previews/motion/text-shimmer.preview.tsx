"use client";

import { TextShimmer } from "@/components/motion/text-shimmer";

export function TextShimmerPreview() {
  return (
    <div className="flex flex-col gap-4">
      <TextShimmer className="text-3xl font-semibold">Loading projects…</TextShimmer>
      <TextShimmer duration={1.5} className="text-sm">Faster shimmer</TextShimmer>
    </div>
  );
}
