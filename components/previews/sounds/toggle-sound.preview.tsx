"use client";

import { toggleOffSound, toggleOnSound } from "@/lib/sounds/toggle";
import { SoundPreviewPad } from "./sound-pad";

export function ToggleSoundPreview() {
  return <SoundPreviewPad name="Toggle" sounds={[toggleOnSound, toggleOffSound]} />;
}
