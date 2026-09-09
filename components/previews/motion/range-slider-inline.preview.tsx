"use client";

import { InlineSlider } from "@/components/motion/range-slider-inline";

export function InlineSliderPreview() {
  return (
    <div className="w-full max-w-sm">
      <InlineSlider
        defaultValue={48}
        min={8}
        max={128}
        step={8}
        label="Icon size"
        aria-label="Icon size"
        formatValueText={(value) => `${value} pixels`}
      />
    </div>
  );
}
