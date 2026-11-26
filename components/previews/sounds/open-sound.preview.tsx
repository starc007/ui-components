"use client";

import { openSound } from "@/lib/sounds/open";
import { SoundPreviewPad } from "./sound-pad";

export function OpenSoundPreview() {
  return <SoundPreviewPad name="Open" sounds={[openSound]} />;
}
