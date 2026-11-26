"use client";

import { starSound } from "@/lib/sounds/star";
import { SoundPreviewPad } from "./sound-pad";

export function StarSoundPreview() {
  return <SoundPreviewPad name="Star" sounds={[starSound]} />;
}
