"use client";

import { errorSound } from "@/lib/sounds/error";
import { SoundPreviewPad } from "./sound-pad";

export function ErrorSoundPreview() {
  return <SoundPreviewPad name="Error" sounds={[errorSound]} />;
}
