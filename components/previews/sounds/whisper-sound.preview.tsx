"use client";

import { whisperSound } from "@/lib/sounds/whisper";
import { SoundPreviewPad } from "./sound-pad";

export function WhisperSoundPreview() {
  return <SoundPreviewPad name="Whisper" sounds={[whisperSound]} />;
}
