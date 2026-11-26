"use client";

import { useSound } from "@/lib/sound";
import { connectSound } from "@/lib/sounds/connect";

export function ConnectSoundUsage() {
  const play = useSound(connectSound);
  return (
    <button type="button" onClick={() => play()} className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
      Connect
    </button>
  );
}
