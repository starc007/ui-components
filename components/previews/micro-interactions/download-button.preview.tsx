"use client";

import { DownloadButton } from "@/components/motion/download-button";
import { useAutoplay } from "./autoplay";

export function DownloadButtonPreview() {
  // Presses while it is busy are ignored, so the loop waits for each run.
  const stage = useAutoplay(() => stage.ref.current?.querySelector("button")?.click(), 1500);

  return (
    <div {...stage}>
      <DownloadButton sound />
    </div>
  );
}
