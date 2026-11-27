"use client";

import { burstSound } from "@/lib/sounds/burst";
import { SoundPreviewPad } from "./sound-pad";

export function BurstSoundPreview() {
  return <SoundPreviewPad name="Burst" sounds={[burstSound]} />;
}
