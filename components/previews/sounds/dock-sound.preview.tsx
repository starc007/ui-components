"use client";

import { dockSound } from "@/lib/sounds/dock";
import { SoundPreviewPad } from "./sound-pad";

export function DockSoundPreview() {
  return <SoundPreviewPad name="Dock" sounds={[dockSound]} />;
}
