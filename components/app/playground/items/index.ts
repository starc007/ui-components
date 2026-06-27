import type { PlaygroundItem } from "../core";
import { springItem } from "./spring";
import { staggerItem } from "./stagger";
import { tweenItem } from "./tween";

/**
 * Local playground catalog — NOT the shadcn registry (`lib/registry.ts`). These
 * never ship as installable components. Phase-2 types appear as disabled
 * "soon" rows until their module lands.
 */
export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  springItem,
  tweenItem,
  staggerItem,
];

export const PLAYGROUND_SOON: { slug: string; label: string }[] = [
  { slug: "keyframes", label: "Keyframes" },
  { slug: "gestures", label: "Gestures" },
  { slug: "layout", label: "Layout" },
  { slug: "scroll", label: "Scroll" },
];
