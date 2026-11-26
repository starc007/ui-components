"use client";

import { connectSound } from "@/lib/sounds/connect";
import { SoundPreviewPad } from "./sound-pad";

export function ConnectSoundPreview() {
  return <SoundPreviewPad name="Connect" sounds={[connectSound]} />;
}
