"use client";

import { pressSound } from "@/lib/sounds/press";
import { SoundPreviewPad } from "./sound-pad";

export function PressSoundPreview() {
  return <SoundPreviewPad name="Press" sounds={[pressSound]} />;
}
