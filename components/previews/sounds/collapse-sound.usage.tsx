"use client";

import { useSound } from "@/lib/sound";
import { collapseSound } from "@/lib/sounds/collapse";

export function CollapseSoundUsage() {
  const play = useSound(collapseSound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Collapse
    </button>
  );
}
