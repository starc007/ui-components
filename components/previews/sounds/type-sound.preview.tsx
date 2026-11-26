"use client";

import { typeSound } from "@/lib/sounds/type";
import { SoundPreviewPad } from "./sound-pad";

export function TypeSoundPreview() {
  return <SoundPreviewPad name="Type" sounds={[typeSound]} />;
}
