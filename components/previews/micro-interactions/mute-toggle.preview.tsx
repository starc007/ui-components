"use client";

import { useState } from "react";
import { MuteToggle } from "@/components/motion/mute-toggle";
import { useAutoplay } from "./autoplay";

export function MuteTogglePreview() {
  const [muted, setMuted] = useState(false);
  const stage = useAutoplay(() => setMuted((value) => !value), 1600);

  return (
    <div {...stage}>
      <MuteToggle muted={muted} onMutedChange={setMuted} />
    </div>
  );
}
