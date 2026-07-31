"use client";

import { useState } from "react";

import { WaveSlider } from "@/components/motion/range-slider-wave";

export function RangeSliderWavePreview() {
  const [value, setValue] = useState(45);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Gain</span>
        <span className="tabular-nums text-foreground">{value}</span>
      </div>
      <WaveSlider value={value} onValueChange={setValue} aria-label="Gain" />
    </div>
  );
}
