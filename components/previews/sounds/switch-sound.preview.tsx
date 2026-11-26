"use client";

import { switchSound } from "@/lib/sounds/switch";
import { SoundPreviewPad } from "./sound-pad";

export function SwitchSoundPreview() {
  return <SoundPreviewPad name="Switch" sounds={[switchSound]} />;
}
