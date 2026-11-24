"use client";

import { useSound } from "@/lib/sound";
import { tickSound } from "@/lib/sounds/tick";

export function TickSoundUsage() {
  const play = useSound(tickSound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Next step
    </button>
  );
}
