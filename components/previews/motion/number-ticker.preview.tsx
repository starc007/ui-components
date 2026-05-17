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
    <div className="grid grid-cols-2 gap-6 text-(--color-fg)">
      <Stat label="Active users">
        <NumberTicker value={value} className="text-4xl font-semibold" format={(n) => n.toLocaleString()} />
      </Stat>
      <Stat label="MRR">
        <NumberTicker value={129480} prefix="$" className="text-4xl font-semibold" format={(n) => n.toLocaleString()} />
      </Stat>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-5">
      <div className="text-xs text-(--color-fg-muted)">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
