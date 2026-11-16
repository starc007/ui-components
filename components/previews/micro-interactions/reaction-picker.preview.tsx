"use client";

import { useRef } from "react";
import { ReactionPicker } from "@/components/motion/reaction-picker";
import { useAutoplay } from "./autoplay";

// The reactions the loop picks, in turn.
const PICKS = ["Love", "Fire", "Party", "Like"];

export function ReactionPickerPreview() {
  // One tick opens the tray, the next picks a reaction.
  const pick = useRef(0);
  const stage = useAutoplay(() => {
    const root = stage.ref.current;
    const label = PICKS[pick.current % PICKS.length];
    const option = root?.querySelector<HTMLButtonElement>(`[role="group"] button[aria-label="${label}"]`);
    if (option) {
      pick.current++;
      option.click();
    } else {
      root?.querySelector<HTMLButtonElement>('button[aria-haspopup="true"]')?.click();
    }
  }, 1300);

  return (
    // Room above for the tray to open into.
    <div {...stage} className="pt-12">
      <ReactionPicker count={24} />
    </div>
  );
}
