"use client";

import { buzzSound } from "@/lib/sounds/buzz";
import { SoundPreviewPad } from "./sound-pad";

export function BuzzSoundPreview() {
  return <SoundPreviewPad name="Buzz" sounds={[buzzSound]} />;
}
