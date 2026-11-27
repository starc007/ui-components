"use client";

import { refreshSound } from "@/lib/sounds/refresh";
import { SoundPreviewPad } from "./sound-pad";

export function RefreshSoundPreview() {
  return <SoundPreviewPad name="Refresh" sounds={[refreshSound]} />;
}
