"use client";

import {
  KnockoutBracket,
  ROUNDS,
  THIRD_PLACE,
} from "@/components/motion/knockout-bracket";

export function KnockoutBracketPreview() {
  return (
    <div className="w-full py-8">
      <KnockoutBracket rounds={ROUNDS} thirdPlace={THIRD_PLACE} />
    </div>
  );
}
