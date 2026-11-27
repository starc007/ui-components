import type { Transition, Variants } from "motion/react";
import { SPRING_MORPH } from "@/lib/ease";

// Trigger box grows into the full-width panel and back, one shared surface.
export const MORPH: Transition = SPRING_MORPH;

export const LIST: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } },
};

export const ITEM: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

// Shared padding for the account trigger + panel header so the avatar/name stay
// put as the box morphs - the panel reads as the trigger itself growing open.
export const HEAD = "flex items-center gap-2 px-2 py-1.5 text-left";
