"use client";

import { collapseSound } from "@/lib/sounds/collapse";
import { SoundPreviewPad } from "./sound-pad";

export function CollapseSoundPreview() {
  return <SoundPreviewPad name="Collapse" sounds={[collapseSound]} />;
}
