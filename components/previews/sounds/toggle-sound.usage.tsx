"use client";

import { useState } from "react";
import { useSound } from "@/lib/sound";
import { toggleOffSound, toggleOnSound } from "@/lib/sounds/toggle";

export function ToggleSoundUsage() {
  const [on, setOn] = useState(false);
  const playOn = useSound(toggleOnSound);
  const playOff = useSound(toggleOffSound);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        if (on) playOff();
        else playOn();
        setOn(!on);
      }}
      className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
    >
      {on ? "On" : "Off"}
    </button>
  );
}
