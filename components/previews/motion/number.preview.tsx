"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { NumberTicker } from "@/components/motion/number-ticker";

export function NumberPreview() {
  const [value, setValue] = useState(48273);

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((currentValue) => currentValue + Math.floor(Math.random() * 50));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div>
        <p className="text-xs text-(--color-fg-muted)">Active users</p>
        <NumberTicker
          value={value}
          className="text-3xl font-semibold tracking-tight text-(--color-fg) tabular-nums"
          format={(number) => number.toLocaleString()}
        />
      </div>
      <div>
        <p className="text-xs text-(--color-fg-muted)">Revenue</p>
        <div className="text-3xl font-semibold tracking-tight text-(--color-fg) tabular-nums">
          <AnimatedNumber
            value={129480}
            format={(number) => `$${Math.round(number).toLocaleString()}`}
          />
        </div>
      </div>
    </div>
  );
}
