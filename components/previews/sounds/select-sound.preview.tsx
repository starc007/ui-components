"use client";

import { selectSound } from "@/lib/sounds/select";
import { SoundPreviewPad } from "./sound-pad";

export function SelectSoundPreview() {
  return <SoundPreviewPad name="Select" sounds={[selectSound]} />;
}
