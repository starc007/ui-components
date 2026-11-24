"use client";

import { useSound } from "@/lib/sound";
import { copySound } from "@/lib/sounds/copy";

export function CopySoundUsage() {
  const play = useSound(copySound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Copy link
    </button>
  );
}
