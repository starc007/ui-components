"use client";

import { useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { useAutoplay } from "./autoplay";

// Pairs that share letters, so the morph has something to keep.
const WORDS = ["Plan", "Planning", "Planned", "Ship", "Shipping", "Shipped"];

export function TextMorphPreview() {
  const [index, setIndex] = useState(0);
  const stage = useAutoplay(() => setIndex((value) => (value + 1) % WORDS.length), 1600);

  return (
    <div {...stage}>
      <p className="text-3xl font-medium tracking-tight text-foreground">
        <TextMorph>{WORDS[index]}</TextMorph>
      </p>
    </div>
  );
}
