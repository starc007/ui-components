"use client";

import { ShareButton } from "@/components/motion/share-button";
import { useAutoplay } from "./autoplay";

export function ShareButtonPreview() {
  // Fan out, choose Copy link (the button only reports it, nothing is
  // copied), let it fold back, repeat.
  const stage = useAutoplay(() => {
    const root = stage.ref.current;
    const copy = root?.querySelector<HTMLButtonElement>('button[aria-label="Copy link"]');
    if (copy) copy.click();
    else if (!root?.querySelector('button[aria-label="Copied"]')) {
      root?.querySelector<HTMLButtonElement>("button[aria-expanded]")?.click();
    }
  }, 1300);

  return (
    // Room above for the fan to open into.
    <div {...stage} className="pt-20">
      <ShareButton />
    </div>
  );
}
