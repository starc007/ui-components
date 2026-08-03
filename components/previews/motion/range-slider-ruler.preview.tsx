"use client";

import { useState } from "react";

import { RulerSlider } from "@/components/motion/range-slider-ruler";

export function RangeSliderRulerPreview() {
  const [value, setValue] = useState(72.5);

  return (
    <div className="w-full max-w-sm">
      <RulerSlider
        value={value}
        onValueChange={setValue}
        min={40}
        max={120}
        step={0.5}
        gap={12}
        majorEvery={10}
        unit="kg"
        aria-label="Weight"
      />
    </div>
  );
}
