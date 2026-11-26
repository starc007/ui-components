"use client";

import { RefreshButton } from "@/components/motion/refresh-button";
import { useAutoplay } from "./autoplay";

export function RefreshButtonPreview() {
  const stage = useAutoplay(() => stage.ref.current?.querySelector("button")?.click(), 1500);

  return (
    <div {...stage}>
      <RefreshButton sound />
    </div>
  );
}
