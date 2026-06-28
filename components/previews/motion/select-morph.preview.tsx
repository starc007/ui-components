"use client";

import { useState } from "react";
import { MorphSelect } from "@/components/motion/select-morph";

const OPTIONS = [
  { label: "Next.js", value: "next" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
  { label: "Vite", value: "vite" },
];

export function SelectMorphPreview() {
  const [value, setValue] = useState("next");
  return (
    <div className="w-56">
      <MorphSelect
        options={OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Pick a framework"
      />
    </div>
  );
}
