"use client";

import { successSound } from "@/lib/sounds/success";
import { SoundPreviewPad } from "./sound-pad";

export function SuccessSoundPreview() {
  return <SoundPreviewPad name="Success" sounds={[successSound]} />;
}
