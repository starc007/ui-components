"use client";

import { shutterSound } from "@/lib/sounds/shutter";
import { SoundPreviewPad } from "./sound-pad";

export function ShutterSoundPreview() {
  return <SoundPreviewPad name="Shutter" sounds={[shutterSound]} />;
}
