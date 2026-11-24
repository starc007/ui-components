"use client";

import { navigateSound } from "@/lib/sounds/navigate";
import { SoundPreviewPad } from "./sound-pad";

export function NavigateSoundPreview() {
  return <SoundPreviewPad name="Navigate" sounds={[navigateSound]} />;
}
