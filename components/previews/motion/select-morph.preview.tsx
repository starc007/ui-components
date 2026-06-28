"use client";

import { useState } from "react";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@/components/motion/select-morph";

export function SelectMorphPreview() {
  const [value, setValue] = useState("next");
  return (
    <div className="w-56">
      <MorphSelect value={value} onValueChange={setValue}>
        <MorphSelectTrigger>
          <MorphSelectValue placeholder="Pick a framework" />
        </MorphSelectTrigger>
        <MorphSelectContent>
          <MorphSelectItem value="next">Next.js</MorphSelectItem>
          <MorphSelectItem value="remix">Remix</MorphSelectItem>
          <MorphSelectItem value="astro">Astro</MorphSelectItem>
          <MorphSelectItem value="vite">Vite</MorphSelectItem>
        </MorphSelectContent>
      </MorphSelect>
    </div>
  );
}
