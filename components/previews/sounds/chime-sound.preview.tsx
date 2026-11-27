"use client";

import { chimeSound } from "@/lib/sounds/chime";
import { SoundPreviewPad } from "./sound-pad";

export function ChimeSoundPreview() {
  return <SoundPreviewPad name="Chime" sounds={[chimeSound]} />;
}
