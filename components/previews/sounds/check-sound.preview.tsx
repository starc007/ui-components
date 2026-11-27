"use client";

import { checkSound } from "@/lib/sounds/check";
import { SoundPreviewPad } from "./sound-pad";

export function CheckSoundPreview() {
  return <SoundPreviewPad name="Check" sounds={[checkSound]} />;
}
