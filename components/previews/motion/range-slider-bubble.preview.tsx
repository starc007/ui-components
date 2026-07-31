"use client";

import { useState } from "react";

import { BubbleSlider } from "@/components/motion/range-slider-bubble";

export function RangeSliderBubblePreview() {
  const [value, setValue] = useState(28);

  return (
    <div className="flex w-full max-w-sm flex-col gap-1">
      <span className="text-sm text-muted-foreground">Drag fast — the bubble leans</span>
      <BubbleSlider value={value} onValueChange={setValue} aria-label="Value" />
    </div>
  );
}
