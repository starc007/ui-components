"use client";

import { receiveSound } from "@/lib/sounds/receive";
import { SoundPreviewPad } from "./sound-pad";

export function ReceiveSoundPreview() {
  return <SoundPreviewPad name="Receive" sounds={[receiveSound]} />;
}
