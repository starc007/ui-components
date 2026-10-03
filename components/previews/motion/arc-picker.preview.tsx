"use client";

import { useState } from "react";
import { ArcPicker, type ArcPickerSide } from "@/components/motion/arc-picker";
import { Button } from "@/components/motion/button";

const SIDES = ["top", "bottom", "left", "right"] as const;

const OPTIONS = [
  { value: "first-light", label: "First light" },
  { value: "dawn", label: "Dawn" },
  { value: "daybreak", label: "Daybreak" },
  { value: "sunrise", label: "Sunrise" },
  { value: "early-morning", label: "Early morning" },
  { value: "morning", label: "Morning" },
  { value: "late-morning", label: "Late morning" },
  { value: "midday", label: "Midday" },
  { value: "noon", label: "Noon" },
  { value: "afternoon", label: "Afternoon" },
  { value: "golden-hour", label: "Golden hour" },
  { value: "sunset", label: "Sunset" },
  { value: "blue-hour", label: "Blue hour" },
  { value: "dusk", label: "Dusk" },
  { value: "twilight", label: "Twilight" },
  { value: "evening", label: "Evening" },
  { value: "nightfall", label: "Nightfall" },
  { value: "night", label: "Night" },
  { value: "late-night", label: "Late night" },
  { value: "midnight", label: "Midnight" },
  { value: "deep-night", label: "Deep night" },
  { value: "starlight", label: "Starlight" },
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
      <div className="my-8 flex min-h-108 items-center sm:my-10">
        <ArcPicker
          options={OPTIONS}
          value={value}
          onValueChange={setValue}
          aria-label="Time of day"
          side={side}
          radius={260}
          visibleCount={9}
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
