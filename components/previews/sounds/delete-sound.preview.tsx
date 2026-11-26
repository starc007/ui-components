"use client";

import { deleteSound } from "@/lib/sounds/delete";
import { SoundPreviewPad } from "./sound-pad";

export function DeleteSoundPreview() {
  return <SoundPreviewPad name="Delete" sounds={[deleteSound]} />;
}
