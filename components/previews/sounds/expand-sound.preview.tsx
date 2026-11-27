"use client";

import { expandSound } from "@/lib/sounds/expand";
import { SoundPreviewPad } from "./sound-pad";

export function ExpandSoundPreview() {
  return <SoundPreviewPad name="Expand" sounds={[expandSound]} />;
}
