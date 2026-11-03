"use client";

import { useState } from "react";
import { Plinko } from "@/components/motion/plinko";

const SLOTS = [80, 40, 20, 10, 5, 10, 20, 40, 80];

export function PlinkoPreview() {
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState(0);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Score <span className="font-medium text-foreground">{score}</span> · {drops} balls
      </p>
      <Plinko
        slots={SLOTS}
        onLand={(slot) => {
          setScore((value) => value + SLOTS[slot]);
          setDrops((value) => value + 1);
        }}
      />
    </div>
  );
}
