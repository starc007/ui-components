"use client";

import { trashSound } from "@/lib/sounds/trash";
import { SoundPreviewPad } from "./sound-pad";

export function TrashSoundPreview() {
  return <SoundPreviewPad name="Trash" sounds={[trashSound]} />;
}
