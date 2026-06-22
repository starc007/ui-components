"use client";

import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";

export function NumberTickerPreview() {
  const [value, setValue] = useState(48273);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => v + Math.floor(Math.random() * 50)), 2500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">Active users</p>
      <NumberTicker
        value={value}
        prefix=""
        className="text-4xl font-semibold tracking-tight text-foreground tabular-nums"
        format={(n) => n.toLocaleString()}
      />
      <p className="text-xs text-muted-foreground">live · updates every 2.5s</p>
    </div>
  );
}
