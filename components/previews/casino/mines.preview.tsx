"use client";

import { useState } from "react";
import { formatMultiplier, Mines } from "@/components/motion/mines";

export function MinesPreview() {
  const [best, setBest] = useState(0);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Best cash out <span className="font-medium text-foreground">{formatMultiplier(best)}</span>
      </p>
      <Mines onCashOut={(multiplier) => setBest((value) => Math.max(value, multiplier))} />
    </div>
  );
}
