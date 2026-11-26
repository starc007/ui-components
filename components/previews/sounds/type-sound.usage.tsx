"use client";

import { useSound } from "@/lib/sound";
import { typeSound } from "@/lib/sounds/type";

export function TypeSoundUsage() {
  const play = useSound(typeSound);
  return (
    <input
      aria-label="Message"
      placeholder="Type a message"
      // One keystroke sound per printable key, Space and Backspace.
      onKeyDown={(event) => {
        if (event.key.length === 1 || event.key === "Backspace") play();
      }}
      className="h-9 w-64 rounded-full border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
