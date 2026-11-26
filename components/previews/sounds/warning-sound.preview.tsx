"use client";

import { warningSound } from "@/lib/sounds/warning";
import { SoundPreviewPad } from "./sound-pad";

export function WarningSoundPreview() {
  return <SoundPreviewPad name="Warning" sounds={[warningSound]} />;
}
