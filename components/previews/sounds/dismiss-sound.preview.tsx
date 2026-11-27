"use client";

import { dismissSound } from "@/lib/sounds/dismiss";
import { SoundPreviewPad } from "./sound-pad";

export function DismissSoundPreview() {
  return <SoundPreviewPad name="Dismiss" sounds={[dismissSound]} />;
}
