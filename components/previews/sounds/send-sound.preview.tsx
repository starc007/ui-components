"use client";

import { sendSound } from "@/lib/sounds/send";
import { SoundPreviewPad } from "./sound-pad";

export function SendSoundPreview() {
  return <SoundPreviewPad name="Send" sounds={[sendSound]} />;
}
