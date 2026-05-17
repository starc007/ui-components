import type { ReactNode } from "react";
import { ButtonPreview } from "./primitives/button.preview";
import { InputPreview } from "./primitives/input.preview";
import { TextareaPreview } from "./primitives/textarea.preview";
import { SelectPreview } from "./primitives/select.preview";
import { CheckboxPreview } from "./primitives/checkbox.preview";
import { SwitchPreview } from "./primitives/switch.preview";
import { DialogPreview } from "./primitives/dialog.preview";
import { DrawerPreview } from "./primitives/drawer.preview";
import { SheetPreview } from "./primitives/sheet.preview";
import { TooltipPreview } from "./primitives/tooltip.preview";
import { ToastPreview } from "./primitives/toast.preview";
import { TabsPreview } from "./primitives/tabs.preview";
import { AccordionPreview } from "./primitives/accordion.preview";
import { BadgePreview } from "./primitives/badge.preview";
import { AvatarPreview } from "./primitives/avatar.preview";
import { TextRevealPreview } from "./motion/text-reveal.preview";
import { TextShimmerPreview } from "./motion/text-shimmer.preview";
import { MarqueePreview } from "./motion/marquee.preview";
import { MagneticPreview } from "./motion/magnetic.preview";
import { TiltCardPreview } from "./motion/tilt-card.preview";
import { AnimatedNumberPreview } from "./motion/animated-number.preview";
import { SpotlightCardPreview } from "./motion/spotlight-card.preview";
import { NumberTickerPreview } from "./motion/number-ticker.preview";
import { NavbarPreview } from "./data-nav/navbar.preview";
import { SidebarPreview } from "./data-nav/sidebar.preview";
import { StatCardPreview } from "./data-nav/stat-card.preview";
import { CommandKPreview } from "./data-nav/command-k.preview";
import { BreadcrumbPreview } from "./data-nav/breadcrumb.preview";
import { DataTablePreview } from "./data-nav/data-table.preview";

export const previews: Record<string, () => ReactNode> = {
  "primitives/button": ButtonPreview,
  "primitives/input": InputPreview,
  "primitives/textarea": TextareaPreview,
  "primitives/select": SelectPreview,
  "primitives/checkbox": CheckboxPreview,
  "primitives/switch": SwitchPreview,
  "primitives/dialog": DialogPreview,
  "primitives/drawer": DrawerPreview,
  "primitives/sheet": SheetPreview,
  "primitives/tooltip": TooltipPreview,
  "primitives/toast": ToastPreview,
  "primitives/tabs": TabsPreview,
  "primitives/accordion": AccordionPreview,
  "primitives/badge": BadgePreview,
  "primitives/avatar": AvatarPreview,
  "motion/text-reveal": TextRevealPreview,
  "motion/text-shimmer": TextShimmerPreview,
  "motion/marquee": MarqueePreview,
  "motion/magnetic": MagneticPreview,
  "motion/tilt-card": TiltCardPreview,
  "motion/animated-number": AnimatedNumberPreview,
  "motion/spotlight-card": SpotlightCardPreview,
  "motion/number-ticker": NumberTickerPreview,
  "data-nav/navbar": NavbarPreview,
  "data-nav/sidebar": SidebarPreview,
  "data-nav/stat-card": StatCardPreview,
  "data-nav/command-k": CommandKPreview,
  "data-nav/breadcrumb": BreadcrumbPreview,
  "data-nav/data-table": DataTablePreview,
};

export function getPreview(category: string, slug: string) {
  return previews[`${category}/${slug}`];
}
