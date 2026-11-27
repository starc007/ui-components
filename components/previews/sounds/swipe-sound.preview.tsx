"use client";

import { swipeSound } from "@/lib/sounds/swipe";
import { SoundPreviewPad } from "./sound-pad";

export function SwipeSoundPreview() {
  return <SoundPreviewPad name="Swipe" sounds={[swipeSound]} />;
}
