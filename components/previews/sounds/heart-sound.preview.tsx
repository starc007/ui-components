"use client";

import { heartSound } from "@/lib/sounds/heart";
import { SoundPreviewPad } from "./sound-pad";

export function HeartSoundPreview() {
  return <SoundPreviewPad name="Heart" sounds={[heartSound]} />;
}
