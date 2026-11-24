"use client";

import { closeSound } from "@/lib/sounds/close";
import { SoundPreviewPad } from "./sound-pad";

export function CloseSoundPreview() {
  return <SoundPreviewPad name="Close" sounds={[closeSound]} />;
}
