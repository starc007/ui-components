"use client";

import { tickSound } from "@/lib/sounds/tick";
import { SoundPreviewPad } from "./sound-pad";

export function TickSoundPreview() {
  return <SoundPreviewPad name="Tick" sounds={[tickSound]} />;
}
