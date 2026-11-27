"use client";

import { pingSound } from "@/lib/sounds/ping";
import { SoundPreviewPad } from "./sound-pad";

export function PingSoundPreview() {
  return <SoundPreviewPad name="Ping" sounds={[pingSound]} />;
}
