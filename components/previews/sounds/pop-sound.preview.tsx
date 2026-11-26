"use client";

import { popSound } from "@/lib/sounds/pop";
import { SoundPreviewPad } from "./sound-pad";

export function PopSoundPreview() {
  return <SoundPreviewPad name="Pop" sounds={[popSound]} />;
}
