import type { PlaygroundItem } from "../core";
import { gesturesItem } from "./gestures";
import { keyframesItem } from "./keyframes";
import { layoutItem } from "./layout";
import { scrollItem } from "./scroll";
import { springItem } from "./spring";
import { staggerItem } from "./stagger";
import { tweenItem } from "./tween";

/**
 * Local playground catalog — NOT the shadcn registry (`lib/registry.ts`). These
 * never ship as installable components.
 */
export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  springItem,
  tweenItem,
  staggerItem,
  keyframesItem,
  gesturesItem,
  layoutItem,
  scrollItem,
];

export const PLAYGROUND_SOON: { slug: string; label: string }[] = [];
