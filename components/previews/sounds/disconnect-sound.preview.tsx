"use client";

import { disconnectSound } from "@/lib/sounds/disconnect";
import { SoundPreviewPad } from "./sound-pad";

export function DisconnectSoundPreview() {
  return <SoundPreviewPad name="Disconnect" sounds={[disconnectSound]} />;
}
