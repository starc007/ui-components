"use client";

import { cameraSound } from "@/lib/sounds/camera";
import { SoundPreviewPad } from "./sound-pad";

export function CameraSoundPreview() {
  return <SoundPreviewPad name="Camera" sounds={[cameraSound]} />;
}
