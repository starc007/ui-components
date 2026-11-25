import type { ReactNode } from "react";
import type { PriceTargetFanMessages } from "./messages";

export interface PriceTarget {
  /** Unique name of the target, such as "High", shown as "{key} target". */
  key: string;
  /** Target price at the horizon, in the chart's currency. */
  price: number;
  /** Number of analysts behind this target, shown in its tooltip. */
  analysts: number;
  /** Any CSS color; the projection, its dot and its label take it. */
  color?: string;
}

export interface PriceHistoryPoint {
  /** ISO date of the price, such as "2026-01-31". */
  date: string;
  /** Traded price on that date. */
  price: number;
}

export type PriceTargetFanActive = { type: "history"; date: string } | { type: "target"; key: string };

export interface PriceTargetFanProps {
  /** Accessible name of the chart. */
  label?: string;
  /** Last traded price; the history walks to this point. */
  current: number;
  /** High, mean and low targets, in that order. */
  targets: [PriceTarget, PriceTarget, PriceTarget];
  /** Axis labels, oldest to horizon. */
  dates?: { start?: string; mid?: string; horizon?: string };
  /** Actual prices, oldest first, using ISO dates. Empty history renders only the current price and targets. */
  history?: PriceHistoryPoint[];
  children?: ReactNode;
  /** Inspected history date or target, for controlled use. */
  active?: PriceTargetFanActive | null;
  /** The initially inspected point when uncontrolled. Default: null */
  defaultActive?: PriceTargetFanActive | null;
  /** Called with the inspected date or target, or `null`, when inspection changes. */
  onActiveChange?: (active: PriceTargetFanActive | null) => void;
  /** Override any built-in string. */
  labels?: Partial<PriceTargetFanMessages>;
  /** Classes merged onto the root element. */
  className?: string;
}
