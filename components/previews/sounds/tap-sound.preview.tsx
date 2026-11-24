"use client";

import { tapSound } from "@/lib/sounds/tap";
import { SoundPreviewPad } from "./sound-pad";

export function TapSoundPreview() {
  return <SoundPreviewPad name="Tap" sounds={[tapSound]} />;
}
