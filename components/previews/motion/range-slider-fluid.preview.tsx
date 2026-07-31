"use client";

import { useState } from "react";

import { FluidSlider } from "@/components/motion/range-slider-fluid";

export function RangeSliderFluidPreview() {
  const [value, setValue] = useState(35);

  return (
    <div className="w-full max-w-sm">
      <FluidSlider
        value={value}
        onValueChange={setValue}
        label="Brightness"
        aria-label="Brightness"
      />
    </div>
  );
}
