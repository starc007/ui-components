"use client";

import { revealSound } from "@/lib/sounds/reveal";
import { SoundPreviewPad } from "./sound-pad";

export function RevealSoundPreview() {
  return <SoundPreviewPad name="Reveal" sounds={[revealSound]} />;
}
