"use client";

import { useSound } from "@/lib/sound";
import { navigateSound } from "@/lib/sounds/navigate";

export function NavigateSoundUsage() {
  const play = useSound(navigateSound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Next page
    </button>
  );
}
