"use client";

import { snapSound } from "@/lib/sounds/snap";
import { SoundPreviewPad } from "./sound-pad";

export function SnapSoundPreview() {
  return <SoundPreviewPad name="Snap" sounds={[snapSound]} />;
}
