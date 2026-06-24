"use client";

import { useState } from "react";

import { Slider } from "@/components/motion/slider";

export function SliderPreview() {
  const [value, setValue] = useState(40);

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Volume</span>
          <span className="tabular-nums text-foreground">{value}</span>
        </div>
        <Slider value={value} onValueChange={setValue} aria-label="Volume" />
      </div>

      <Slider
        defaultValue={6}
        min={0}
        max={10}
        step={1}
        aria-label="Rating out of ten"
      />
    </div>
  );
}
