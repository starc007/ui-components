import type { ReactNode } from "react";
import { TiltCardPreview } from "./motion/tilt-card.preview";
import { MarqueePreview } from "./motion/marquee.preview";
import { TextAnimationPreview } from "./motion/text-animation.preview";
import { TextShimmerPreview } from "./motion/text-shimmer.preview";
import { NumberPreview } from "./motion/number.preview";
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
import { ButtonBasePreview } from "./motion/button-base.preview";
import { SwapPreview } from "./motion/swap.preview";
import { ButtonStatefulPreview } from "./motion/button-stateful.preview";
import { ButtonMagneticPreview } from "./motion/button-magnetic.preview";
import { AnimatedBadgePreview } from "./motion/animated-badge.preview";
import { AnimatedToastStackPreview } from "./motion/animated-toast-stack.preview";
import { ExpandableActionBarPreview } from "./motion/expandable-action-bar.preview";
import { ActionSwapPreview } from "./motion/action-swap.preview";
import { ActionSwapBlurPreview } from "./motion/action-swap-blur.preview";
import { ActionSwapRollPreview } from "./motion/action-swap-roll.preview";

export const previews: Record<string, () => ReactNode> = {
  "motion/tilt-card": TiltCardPreview,
  "motion/marquee": MarqueePreview,
  "motion/text-animation": TextAnimationPreview,
  "motion/text-shimmer": TextShimmerPreview,
  "motion/number": NumberPreview,
  "motion/animated-number": AnimatedNumberPreview,
  "motion/number-ticker": NumberTickerPreview,
  "motion/animated-badge": AnimatedBadgePreview,
  "motion/animated-toast-stack": AnimatedToastStackPreview,
  "motion/expandable-action-bar": ExpandableActionBarPreview,
  "motion/action-swap": ActionSwapPreview,
  "motion/action-swap-blur": ActionSwapBlurPreview,
  "motion/action-swap-roll": ActionSwapRollPreview,
  "motion/bottom-sheet": BottomSheetPreview,
  "motion/tabs": TabsPreview,
  "motion/switch": SwitchPreview,
  "motion/command-palette": CommandPalettePreview,
  "motion/shared-layout-bg": SharedLayoutBgPreview,
  "motion/dock": DockPreview,
  "motion/tooltip": TooltipPreview,
  "motion/morphing-modal": MorphingModalPreview,
  "motion/text-reveal": TextRevealPreview,
  "motion/button": ButtonBasePreview,
  "motion/button-base": ButtonBasePreview,
  "motion/button-stateful": ButtonStatefulPreview,
  "motion/button-magnetic": ButtonMagneticPreview,
  "motion/swap": SwapPreview,
};

export function getPreview(category: string, slug: string) {
  return previews[`${category}/${slug}`];
}
