"use client";

import { ThinkingShimmer } from "@/components/agents/loading-states/thinking-shimmer";

export function ThinkingShimmerPreview() {
  return (
    <ThinkingShimmer className="text-lg" duration={1.8}>
      Thinking…
    </ThinkingShimmer>
  );
}
