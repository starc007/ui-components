import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Every preview is a client component dragging the library + motion with it.
// Lazy chunks keep a page's JS limited to the previews it actually renders.
export const previews: Record<string, ComponentType> = {
  "blocks/dynamic-island": dynamic(() =>
    import("./blocks/dynamic-island.preview").then((m) => m.DynamicIslandPreview),
  ),
  "blocks/swap": dynamic(() =>
    import("./blocks/swap.preview").then((m) => m.SwapPreview),
  ),
  "blocks/command-palette": dynamic(() =>
    import("./blocks/command-palette.preview").then((m) => m.CommandPalettePreview),
  ),
  "blocks/feedback-widget": dynamic(() =>
    import("./blocks/feedback-widget.preview").then((m) => m.FeedbackWidgetPreview),
  ),
  "blocks/bloom-menu": dynamic(() =>
    import("./blocks/bloom-menu.preview").then((m) => m.BloomMenuPreview),
  ),
  "blocks/expandable-action-bar": dynamic(() =>
    import("./blocks/expandable-action-bar.preview").then((m) => m.ExpandableActionBarPreview),
  ),
  "blocks/overflow-actions": dynamic(() =>
    import("./blocks/overflow-actions.preview").then((m) => m.OverflowActionsPreview),
  ),
  "blocks/expandable-tabs": dynamic(() =>
    import("./blocks/expandable-tabs.preview").then((m) => m.ExpandableTabsPreview),
  ),
  "blocks/swipeable-list": dynamic(() =>
    import("./blocks/swipeable-list.preview").then((m) => m.SwipeableListPreview),
  ),
  "blocks/file-upload": dynamic(() =>
    import("./blocks/file-upload.preview").then((m) => m.FileUploadPreview),
  ),
  "blocks/prediction-market": dynamic(() =>
    import("./blocks/prediction-market.preview").then(
      (m) => m.PredictionMarketPreview,
    ),
  ),
  "blocks/wallet-card": dynamic(() =>
    import("./blocks/wallet-card.preview").then((m) => m.WalletCardPreview),
  ),
  "motion/table": dynamic(() =>
    import("./motion/table.preview").then((m) => m.TablePreview),
  ),
  "motion/table-editable": dynamic(() =>
    import("./motion/table-editable.preview").then(
      (m) => m.TableEditablePreview,
    ),
  ),
  "motion/table-async": dynamic(() =>
    import("./motion/table-async.preview").then((m) => m.TableAsyncPreview),
  ),
  "motion/bouncy-accordion": dynamic(() =>
    import("./motion/bouncy-accordion.preview").then(
      (m) => m.BouncyAccordionPreview,
    ),
  ),
  "motion/tilt-card": dynamic(() =>
    import("./motion/tilt-card.preview").then((m) => m.TiltCardPreview),
  ),
  "motion/marquee": dynamic(() =>
    import("./motion/marquee.preview").then((m) => m.MarqueePreview),
  ),
  "motion/text-animation": dynamic(() =>
    import("./motion/text-animation.preview").then((m) => m.TextAnimationPreview),
  ),
  "motion/text-shimmer": dynamic(() =>
    import("./motion/text-shimmer.preview").then((m) => m.TextShimmerPreview),
  ),
  "motion/number": dynamic(() =>
    import("./motion/number.preview").then((m) => m.NumberPreview),
  ),
  "motion/animated-number": dynamic(() =>
    import("./motion/animated-number.preview").then((m) => m.AnimatedNumberPreview),
  ),
  "motion/number-ticker": dynamic(() =>
    import("./motion/number-ticker.preview").then((m) => m.NumberTickerPreview),
  ),
  "motion/animated-badge": dynamic(() =>
    import("./motion/animated-badge.preview").then((m) => m.AnimatedBadgePreview),
  ),
  "motion/animated-toast-stack": dynamic(() =>
    import("./motion/animated-toast-stack.preview").then((m) => m.AnimatedToastStackPreview),
  ),
  "motion/action-swap": dynamic(() =>
    import("./motion/action-swap.preview").then((m) => m.ActionSwapPreview),
  ),
  "motion/action-swap-blur": dynamic(() =>
    import("./motion/action-swap-blur.preview").then((m) => m.ActionSwapBlurPreview),
  ),
  "motion/action-swap-roll": dynamic(() =>
    import("./motion/action-swap-roll.preview").then((m) => m.ActionSwapRollPreview),
  ),
  "motion/action-swap-cascade": dynamic(() =>
    import("./motion/action-swap-cascade.preview").then((m) => m.ActionSwapCascadePreview),
  ),
  "motion/bottom-sheet": dynamic(() =>
    import("./motion/bottom-sheet.preview").then((m) => m.BottomSheetPreview),
  ),
  "motion/tabs": dynamic(() =>
    import("./motion/tabs.preview").then((m) => m.TabsPreview),
  ),
  "motion/switch": dynamic(() =>
    import("./motion/switch.preview").then((m) => m.SwitchPreview),
  ),
  "motion/input": dynamic(() =>
    import("./motion/input.preview").then((m) => m.InputPreview),
  ),
  "motion/select": dynamic(() =>
    import("./motion/select.preview").then((m) => m.SelectPreview),
  ),
  "motion/select-morph": dynamic(() =>
    import("./motion/select-morph.preview").then((m) => m.SelectMorphPreview),
  ),
  "motion/checkbox": dynamic(() =>
    import("./motion/checkbox.preview").then((m) => m.CheckboxPreview),
  ),
  "motion/radio": dynamic(() =>
    import("./motion/radio.preview").then((m) => m.RadioPreview),
  ),
  "blocks/otp-input": dynamic(() =>
    import("./blocks/otp-input.preview").then((m) => m.OTPInputPreview),
  ),
  "blocks/not-found-glitch": dynamic(() =>
    import("./blocks/not-found-glitch.preview").then((m) => m.NotFoundGlitchPreview),
  ),
  "blocks/not-found-magnetic": dynamic(() =>
    import("./blocks/not-found-magnetic.preview").then((m) => m.NotFoundMagneticPreview),
  ),
  "blocks/not-found-spotlight": dynamic(() =>
    import("./blocks/not-found-spotlight.preview").then((m) => m.NotFoundSpotlightPreview),
  ),
  "blocks/not-found-stacked": dynamic(() =>
    import("./blocks/not-found-stacked.preview").then((m) => m.NotFoundStackedPreview),
  ),
  "blocks/not-found-terminal": dynamic(() =>
    import("./blocks/not-found-terminal.preview").then((m) => m.NotFoundTerminalPreview),
  ),
  "motion/drawer": dynamic(() =>
    import("./motion/drawer.preview").then((m) => m.DrawerPreview),
  ),
  "motion/shared-layout-bg": dynamic(() =>
    import("./motion/shared-layout-bg.preview").then((m) => m.SharedLayoutBgPreview),
  ),
  "motion/dock": dynamic(() =>
    import("./motion/dock.preview").then((m) => m.DockPreview),
  ),
  "motion/tooltip": dynamic(() =>
    import("./motion/tooltip.preview").then((m) => m.TooltipPreview),
  ),
  "motion/morphing-modal": dynamic(() =>
    import("./motion/morphing-modal.preview").then((m) => m.MorphingModalPreview),
  ),
  "motion/text-reveal": dynamic(() =>
    import("./motion/text-reveal.preview").then((m) => m.TextRevealPreview),
  ),
  "motion/text-cascade": dynamic(() =>
    import("./motion/text-cascade.preview").then((m) => m.TextCascadePreview),
  ),
  "motion/button": dynamic(() =>
    import("./motion/button-base.preview").then((m) => m.ButtonBasePreview),
  ),
  "motion/button-base": dynamic(() =>
    import("./motion/button-base.preview").then((m) => m.ButtonBasePreview),
  ),
  "motion/button-stateful": dynamic(() =>
    import("./motion/button-stateful.preview").then((m) => m.ButtonStatefulPreview),
  ),
  "motion/button-magnetic": dynamic(() =>
    import("./motion/button-magnetic.preview").then((m) => m.ButtonMagneticPreview),
  ),
  "motion/theme-toggle": dynamic(() =>
    import("./motion/theme-toggle.preview").then((m) => m.ThemeTogglePreview),
  ),
  "motion/smooth-scroll": dynamic(() =>
    import("./motion/smooth-scroll.preview").then((m) => m.SmoothScrollPreview),
  ),
  "motion/scroll-progress": dynamic(() =>
    import("./motion/scroll-progress.preview").then((m) => m.ScrollProgressPreview),
  ),
  "motion/parallax": dynamic(() =>
    import("./motion/parallax.preview").then((m) => m.ParallaxPreview),
  ),
  "motion/scroll-to": dynamic(() =>
    import("./motion/scroll-to.preview").then((m) => m.ScrollToPreview),
  ),
  "motion/scroll-reveal": dynamic(() =>
    import("./motion/scroll-reveal.preview").then((m) => m.ScrollRevealPreview),
  ),
  "motion/range-slider": dynamic(() =>
    import("./motion/range-slider.preview").then((m) => m.RangeSliderPreview),
  ),
  "motion/shader-background": dynamic(() =>
    import("./motion/shader-background.preview").then(
      (m) => m.ShaderBackgroundPreview,
    ),
  ),
  "motion/cylinder-carousel": dynamic(() =>
    import("./motion/cylinder-carousel.preview").then(
      (m) => m.CylinderCarouselPreview,
    ),
  ),
  "motion/loader": dynamic(() =>
    import("./motion/loader.preview").then((m) => m.LoaderPreview),
  ),
};

export function getPreview(category: string, slug: string) {
  return previews[`${category}/${slug}`];
}
