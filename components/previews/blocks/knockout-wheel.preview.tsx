"use client";

import { KnockoutWheel, ROUNDS } from "@/components/motion/knockout-wheel";

export function KnockoutWheelPreview() {
  return (
    <div className="w-full py-8">
      <KnockoutWheel rounds={ROUNDS} />
    </div>
  );
}
