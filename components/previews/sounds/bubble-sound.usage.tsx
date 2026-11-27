"use client";

import { useSound } from "@/lib/sound";
import { bubbleSound } from "@/lib/sounds/bubble";

export function BubbleSoundUsage() {
  const play = useSound(bubbleSound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Bubble
    </button>
  );
}
