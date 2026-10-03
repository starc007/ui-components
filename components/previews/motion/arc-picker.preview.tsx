"use client";

import { useState } from "react";
import { ArcPicker, type ArcPickerSide } from "@/components/motion/arc-picker";
import { Button } from "@/components/motion/button";

const SIDES = ["top", "bottom", "left", "right"] as const;

const OPTIONS = [
  { value: "dawn", label: "Dawn" },
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "afternoon", label: "Afternoon" },
  { value: "golden-hour", label: "Golden hour" },
  { value: "dusk", label: "Dusk" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: "midnight", label: "Midnight" },
];

export function ArcPickerPreview() {
  const [value, setValue] = useState("golden-hour");
  const [side, setSide] = useState<ArcPickerSide>("right");

  return (
    <div className="w-full max-w-xl py-5">
      <fieldset className="flex flex-wrap items-center justify-center gap-1 px-4">
        <legend className="sr-only">Curve side</legend>
        {SIDES.map((direction) => (
          <Button
            key={direction}
            size="sm"
            variant={side === direction ? "secondary" : "ghost"}
            aria-pressed={side === direction}
            onClick={() => setSide(direction)}
            className="capitalize"
          >
            {direction}
          </Button>
        ))}
      </fieldset>
      <div className="flex min-h-88 items-center">
        <ArcPicker
          options={OPTIONS}
          value={value}
          onValueChange={setValue}
          aria-label="Time of day"
          side={side}
          radius={260}
          visibleCount={7}
          itemHeight={48}
        />
      </div>
      <p className="px-6 text-center text-xs text-muted-foreground">
        Drag{" "}
        {side === "top" || side === "bottom" ? "horizontally" : "vertically"},
        scroll or use the arrow keys.
      </p>
    </div>
  );
}
