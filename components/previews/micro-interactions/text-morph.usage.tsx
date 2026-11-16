"use client";

import { useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";

export function TextMorphUsage() {
  const [saved, setSaved] = useState(false);

  return (
    <button type="button" onClick={() => setSaved((value) => !value)} className="text-sm font-medium">
      <TextMorph>{saved ? "Saved" : "Save changes"}</TextMorph>
    </button>
  );
}
