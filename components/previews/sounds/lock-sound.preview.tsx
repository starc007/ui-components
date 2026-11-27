"use client";

import { lockSound } from "@/lib/sounds/lock";
import { SoundPreviewPad } from "./sound-pad";

export function LockSoundPreview() {
  return <SoundPreviewPad name="Lock" sounds={[lockSound]} />;
}
