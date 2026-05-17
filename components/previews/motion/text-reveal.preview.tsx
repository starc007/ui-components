"use client";

import { TextReveal } from "@/components/motion/text-reveal";

export function TextRevealPreview() {
  return (
    <div className="h-[200vh]">
      <div className="sticky top-1/2 -translate-y-1/2">
        <TextReveal text="Scroll inside this panel to watch each word fade in as it crosses the viewport." />
      </div>
    </div>
  );
}
