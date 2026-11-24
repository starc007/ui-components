"use client";

import { dropSound } from "@/lib/sounds/drop";
import { SoundPreviewPad } from "./sound-pad";

export function DropSoundPreview() {
  return <SoundPreviewPad name="Drop" sounds={[dropSound]} />;
}
