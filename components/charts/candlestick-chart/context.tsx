"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Candle = {
  /** Stable id, such as the open timestamp. */
  id: string;
  /** Axis and readout label, such as "14:05". */
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export interface CandlestickChartProps {
  candles: readonly Candle[];
  /** Draws a dashed line and tag at this price, usually the last trade. */
  lastPrice?: number;
  /**
   * Controlled crosshair candle, by `id`, so it stays on the same candle as
   * new ones arrive. Pair with `onActiveIdChange`.
   */
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveIdChange?: (id: string | null) => void;
  formatPrice?: (value: number) => string;
  formatVolume?: (value: number) => string;
  /** Accessible name for the chart. */
  label?: string;
  className?: string;
  children?: ReactNode;
}

const defaultPrice = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const defaultVolume = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export function useCandlestickModel({
  candles,
  lastPrice,
  activeId,
  defaultActiveId = null,
  onActiveIdChange,
  formatPrice = defaultPrice,
  formatVolume = defaultVolume,
  label = "Candlestick chart",
}: CandlestickChartProps) {
  const reduce = useReducedMotion() ?? false;
  const [internalActive, setInternalActive] = useState(defaultActiveId);
  const rawActive = activeId === undefined ? internalActive : activeId;
  // Resolve the crosshair during render by id; a candle that scrolled out of
  // the window clears it rather than landing on a neighbour.
  const index = rawActive === null ? -1 : candles.findIndex((candle) => candle.id === rawActive);
  const active = index >= 0 ? index : null;

  // Stable setter that reads the latest candles and callback from a ref.
  const latest = useRef({ candles, controlled: activeId !== undefined, onActiveIdChange });
  useLayoutEffect(() => {
    latest.current = { candles, controlled: activeId !== undefined, onActiveIdChange };
  });
  const setActive = useCallback((next: number | null) => {
    const id = next === null ? null : (latest.current.candles[next]?.id ?? null);
    if (!latest.current.controlled) setInternalActive(id);
    latest.current.onActiveIdChange?.(id);
  }, []);

  const scale = useMemo(() => {
    const lows = candles.map((candle) => candle.low);
    const highs = candles.map((candle) => candle.high);
    if (lastPrice !== undefined) {
      lows.push(lastPrice);
      highs.push(lastPrice);
    }
    const min = lows.length ? Math.min(...lows) : 0;
    const max = highs.length ? Math.max(...highs) : 1;
    const pad = Math.max((max - min) * 0.08, max * 0.0005, 0.0001);
    const volumeMax = Math.max(1, ...candles.map((candle) => candle.volume));
    return { min: min - pad, max: max + pad, volumeMax };
  }, [candles, lastPrice]);

  return {
    candles,
    lastPrice,
    active,
    setActive,
    scale,
    formatPrice,
    formatVolume,
    label,
    reduce,
  };
}

export type CandlestickModel = ReturnType<typeof useCandlestickModel>;

export const CandlestickContext = createContext<CandlestickModel | null>(null);

export function useCandlestickChart() {
  const model = useContext(CandlestickContext);
  if (!model)
    throw new Error(
      "CandlestickChart parts must be used inside <CandlestickChart>",
    );
  return model;
}
