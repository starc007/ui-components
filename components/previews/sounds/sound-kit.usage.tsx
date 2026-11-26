"use client";

import { SoundProvider, successSound, tapSound, useSound } from "@/lib/sounds";

function SaveButton() {
  const tap = useSound(tapSound);
  const success = useSound(successSound);
  return (
    <button
      type="button"
      onPointerDown={() => tap()}
      onClick={() => window.setTimeout(() => success(), 400)}
      className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      Save changes
    </button>
  );
}

export function SoundKitUsage() {
  // One provider sets the volume for every sound, and enabled={false} mutes them.
  return (
    <SoundProvider volume={0.8}>
      <SaveButton />
    </SoundProvider>
  );
}
