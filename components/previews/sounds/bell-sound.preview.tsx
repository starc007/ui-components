"use client";

import { bellSound } from "@/lib/sounds/bell";
import { SoundPreviewPad } from "./sound-pad";

export function BellSoundPreview() {
  return <SoundPreviewPad name="Bell" sounds={[bellSound]} />;
}
