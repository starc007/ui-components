"use client";

import { SendButton } from "@/components/motion/send-button";
import { useAutoplay } from "./autoplay";

export function SendButtonPreview() {
  const stage = useAutoplay(() => stage.ref.current?.querySelector("button")?.click(), 1500);

  return (
    <div {...stage}>
      <SendButton />
    </div>
  );
}
