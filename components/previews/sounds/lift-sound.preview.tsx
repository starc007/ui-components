"use client";

import { liftSound } from "@/lib/sounds/lift";
import { SoundPreviewPad } from "./sound-pad";

export function LiftSoundPreview() {
  return <SoundPreviewPad name="Lift" sounds={[liftSound]} />;
}
