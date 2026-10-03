"use client";

import { useState } from "react";
import { ArcPicker } from "@/components/motion/arc-picker";

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

  return (
    <div className="w-full max-w-md py-5">
      <p className="px-6 text-xs text-muted-foreground">Find your moment</p>
      <ArcPicker
        options={OPTIONS}
        value={value}
        onValueChange={setValue}
        aria-label="Time of day"
        radius={260}
        visibleCount={7}
        itemHeight={48}
      />
      <p className="px-6 text-xs text-muted-foreground">
        Drag, scroll or use the arrow keys.
      </p>
    </div>
  );
}
