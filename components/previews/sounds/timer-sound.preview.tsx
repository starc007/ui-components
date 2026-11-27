"use client";

import { timerSound } from "@/lib/sounds/timer";
import { SoundPreviewPad } from "./sound-pad";

export function TimerSoundPreview() {
  return <SoundPreviewPad name="Timer" sounds={[timerSound]} />;
}
