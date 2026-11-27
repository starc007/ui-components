"use client";

import { useSound } from "@/lib/sound";
import { snapSound } from "@/lib/sounds/snap";

export function SnapSoundUsage() {
  const play = useSound(snapSound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Snap
    </button>
  );
}
