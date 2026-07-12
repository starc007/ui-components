"use client";

import { KnockoutBracket, ROUNDS } from "@/components/motion/knockout-bracket";

export function KnockoutBracketPreview() {
  return (
    <div className="w-full py-8">
      <KnockoutBracket rounds={ROUNDS} />
    </div>
  );
}
