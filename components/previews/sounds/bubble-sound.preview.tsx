"use client";

import { bubbleSound } from "@/lib/sounds/bubble";
import { SoundPreviewPad } from "./sound-pad";

export function BubbleSoundPreview() {
  return <SoundPreviewPad name="Bubble" sounds={[bubbleSound]} />;
}
