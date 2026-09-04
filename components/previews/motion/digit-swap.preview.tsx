"use client";

import { useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";

const CARD_NUMBER = "4242 4242 4242 0806";
const MASKED_NUMBER = "•••• •••• •••• 0806";

export function DigitSwapPreview() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex w-80 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Card number
        </span>
        <DigitSwap
          value={revealed ? CARD_NUMBER : MASKED_NUMBER}
          animationKey={revealed ? "revealed" : "masked"}
          direction={revealed ? "up" : "down"}
          suffixLength={4}
          glyphClassName={
            revealed ? "text-foreground" : "text-muted-foreground"
          }
          suffixClassName="text-foreground"
          className="font-mono text-lg tracking-[0.08em] tabular-nums"
        />
      </div>

      <button
        type="button"
        aria-label={revealed ? "Animate masked number" : "Animate card number"}
        aria-pressed={revealed}
        onClick={() => setRevealed((current) => !current)}
        className="h-10 self-start rounded-lg border border-border px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        Animate
      </button>
    </div>
  );
}
