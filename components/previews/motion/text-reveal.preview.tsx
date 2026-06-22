"use client";

import { useState } from "react";
import { TextReveal } from "@/components/motion/text-reveal";

export function TextRevealPreview() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <div key={key} className="flex flex-col gap-2">
        <TextReveal
          as="h2"
          text={["Motion that feels", "considered."]}
          className="text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-foreground sm:text-5xl"
        />
        <TextReveal
          text="Word by word, with a soft blur."
          delay={0.9}
          stagger={0.05}
          blur={6}
          yOffset="20%"
          className="text-sm text-muted-foreground"
        />
      </div>

      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-xs font-medium text-foreground press hover:border-(--color-border-strong)"
      >
        Replay
      </button>
    </div>
  );
}
