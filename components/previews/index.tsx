import type { ReactNode } from "react";
import { TiltCardPreview } from "./motion/tilt-card.preview";
import { MagneticPreview } from "./motion/magnetic.preview";
import { MarqueePreview } from "./motion/marquee.preview";
import { TextShimmerPreview } from "./motion/text-shimmer.preview";
import { AnimatedNumberPreview } from "./motion/animated-number.preview";
import { NumberTickerPreview } from "./motion/number-ticker.preview";
import { BottomSheetPreview } from "./motion/bottom-sheet.preview";
import { TabsPreview } from "./motion/tabs.preview";
import { SwitchPreview } from "./motion/switch.preview";
import { CommandPalettePreview } from "./motion/command-palette.preview";
import { SharedLayoutBgPreview } from "./motion/shared-layout-bg.preview";
import { DockPreview } from "./motion/dock.preview";
import { TooltipPreview } from "./motion/tooltip.preview";
import { MorphingModalPreview } from "./motion/morphing-modal.preview";
import { TextRevealPreview } from "./motion/text-reveal.preview";

export const previews: Record<string, () => ReactNode> = {
  "motion/tilt-card": TiltCardPreview,
  "motion/magnetic": MagneticPreview,
  "motion/marquee": MarqueePreview,
  "motion/text-shimmer": TextShimmerPreview,
  "motion/animated-number": AnimatedNumberPreview,
  "motion/number-ticker": NumberTickerPreview,
  "motion/bottom-sheet": BottomSheetPreview,
  "motion/tabs": TabsPreview,
  "motion/switch": SwitchPreview,
  "motion/command-palette": CommandPalettePreview,
  "motion/shared-layout-bg": SharedLayoutBgPreview,
  "motion/dock": DockPreview,
  "motion/tooltip": TooltipPreview,
  "motion/morphing-modal": MorphingModalPreview,
  "motion/text-reveal": TextRevealPreview,
};

export function getPreview(category: string, slug: string) {
  return previews[`${category}/${slug}`];
}
