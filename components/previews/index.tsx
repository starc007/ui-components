import type { ReactNode } from "react";
import { SpotlightCardPreview } from "./motion/spotlight-card.preview";
import { TiltCardPreview } from "./motion/tilt-card.preview";
import { MagneticPreview } from "./motion/magnetic.preview";
import { MarqueePreview } from "./motion/marquee.preview";
import { TextRevealPreview } from "./motion/text-reveal.preview";
import { TextShimmerPreview } from "./motion/text-shimmer.preview";
import { AnimatedNumberPreview } from "./motion/animated-number.preview";
import { NumberTickerPreview } from "./motion/number-ticker.preview";
import { BottomSheetPreview } from "./motion/bottom-sheet.preview";

export const previews: Record<string, () => ReactNode> = {
  "motion/spotlight-card": SpotlightCardPreview,
  "motion/tilt-card": TiltCardPreview,
  "motion/magnetic": MagneticPreview,
  "motion/marquee": MarqueePreview,
  "motion/text-reveal": TextRevealPreview,
  "motion/text-shimmer": TextShimmerPreview,
  "motion/animated-number": AnimatedNumberPreview,
  "motion/number-ticker": NumberTickerPreview,
  "motion/bottom-sheet": BottomSheetPreview,
};

export function getPreview(category: string, slug: string) {
  return previews[`${category}/${slug}`];
}
