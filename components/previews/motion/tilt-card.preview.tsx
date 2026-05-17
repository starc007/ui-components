"use client";

import { TiltCard } from "@/components/motion/tilt-card";

export function TiltCardPreview() {
  return (
    <div className="flex items-center justify-center p-6">
      <TiltCard className="w-[280px] border border-(--color-border) bg-(--color-bg-elev) p-8">
        <div className="text-xs uppercase tracking-wider text-(--color-fg-muted)">Premium</div>
        <h3 className="mt-2 text-2xl font-semibold text-(--color-fg)">Tilt me</h3>
        <p className="mt-3 text-sm text-(--color-fg-muted)">Move your cursor across the card to see 3D tilt + glare.</p>
      </TiltCard>
    </div>
  );
}
