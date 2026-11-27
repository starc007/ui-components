"use client";

import { unlockSound } from "@/lib/sounds/unlock";
import { SoundPreviewPad } from "./sound-pad";

export function UnlockSoundPreview() {
  return <SoundPreviewPad name="Unlock" sounds={[unlockSound]} />;
}
