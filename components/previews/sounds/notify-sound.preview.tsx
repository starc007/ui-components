"use client";

import { notifySound } from "@/lib/sounds/notify";
import { SoundPreviewPad } from "./sound-pad";

export function NotifySoundPreview() {
  return <SoundPreviewPad name="Notify" sounds={[notifySound]} />;
}
