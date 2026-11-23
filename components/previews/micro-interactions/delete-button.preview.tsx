"use client";

import { DeleteButton } from "@/components/motion/delete-button";
import { useAutoplay } from "./autoplay";

export function DeleteButtonPreview() {
  // Press the bin, then the tick, then let the spinner and check play out.
  // While those show there is no button to press, so the loop just waits.
  const stage = useAutoplay(() => {
    const pill = stage.ref.current;
    const button =
      pill?.querySelector<HTMLButtonElement>('button[aria-label="Confirm delete"]') ??
      pill?.querySelector<HTMLButtonElement>('button[aria-label="Delete"]');
    button?.click();
  }, 1500);

  return (
    <div {...stage}>
      <DeleteButton />
    </div>
  );
}
