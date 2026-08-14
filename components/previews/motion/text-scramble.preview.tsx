"use client";

import { useState } from "react";
import { TextScramble } from "@/components/motion/text-scramble";

const PHRASES = [
  "Inspecting the repository",
  "Running the checks",
  "Preparing the update",
];

export function TextScramblePreview() {
  const [index, setIndex] = useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <TextScramble
        text={PHRASES[index]}
        className="font-mono text-xl font-medium text-foreground"
      />

      <button
        type="button"
        onClick={() => setIndex((current) => (current + 1) % PHRASES.length)}
        className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-xs font-medium text-foreground press hover:border-(--color-border-strong)"
      >
        Next phrase
      </button>
    </div>
  );
}
