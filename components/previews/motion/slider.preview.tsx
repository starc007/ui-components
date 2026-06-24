"use client";

import { useState } from "react";

import { Slider } from "@/components/motion/slider";

export function SliderPreview() {
  const [value, setValue] = useState(40);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Drag the handle</span>
        <span className="tabular-nums text-foreground">{value}</span>
      </div>
      <Slider value={value} onValueChange={setValue} step={5} aria-label="Value" />
    </div>
  );
}
