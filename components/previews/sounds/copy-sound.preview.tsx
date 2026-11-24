"use client";

import { copySound } from "@/lib/sounds/copy";
import { SoundPreviewPad } from "./sound-pad";

export function CopySoundPreview() {
  return <SoundPreviewPad name="Copy" sounds={[copySound]} />;
}
