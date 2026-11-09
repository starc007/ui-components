"use client";

import { useState } from "react";
import { SlideGame } from "@/components/motion/slide-game";

export function SlideGamePreview() {
  const [profit, setProfit] = useState(0);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Session profit{" "}
        <span className="font-medium text-foreground">
          {profit >= 0 ? "+" : "−"}${Math.abs(profit).toFixed(2)}
        </span>
      </p>
      <SlideGame
        onResult={(result, target, bet) =>
          setProfit((value) => value + (result >= target ? bet * (target - 1) : -bet))
        }
      />
    </div>
  );
}
