"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";

export function AnimatedNumberPreview() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card label="Active users"><AnimatedNumber value={48273} /></Card>
      <Card label="MRR">
        <AnimatedNumber value={129480} format={(n) => `$${Math.round(n).toLocaleString()}`} />
      </Card>
      <Card label="Conversion">
        <AnimatedNumber value={4.82} format={(n) => `${n.toFixed(2)}%`} />
      </Card>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-4">
      <div className="text-xs text-(--color-fg-muted)">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-(--color-fg)">{children}</div>
    </div>
  );
}
