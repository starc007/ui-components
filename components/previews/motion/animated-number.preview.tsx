"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";

export function AnimatedNumberPreview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
      <div className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        <AnimatedNumber value={129480} format={(n) => `$${Math.round(n).toLocaleString()}`} />
      </div>
      <p className="text-xs text-(--color-success)">+12.4% vs last month</p>
    </div>
  );
}
