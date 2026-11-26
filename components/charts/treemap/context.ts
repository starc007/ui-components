"use client";

import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import { useMessages } from "@/lib/i18n";
import { useInspection } from "../xy/use-inspection";
import { type TreemapMessages, treemapMessages } from "./messages";
import { buildTreemap, layoutTreemap, TREEMAP_COLORS, type TreemapNode } from "./model";

const defaultFormat = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export interface TreemapProps extends ComponentProps<"section"> {
  /** Flat leaves or nested groups. Tile area uses leaf values; groups sum their descendants. */
  data: readonly TreemapNode[];
  /** Chart name, used as its accessible label and table caption. Default: "Treemap" */
  label?: string;
  /** Formats values in tiles, the tooltip and the legend. Defaults to up to 2 decimals. */
  formatValue?: (value: number) => string;
  /** Top-level palette; nodes can override their inherited color and textColor. */
  colors?: readonly string[];
  /** Tile text color, unless a node sets its own. Default: "#ffffff" */
  textColor?: string;
  /** Id of the inspected tile, or null for none, for controlled use. */
  activeId?: string | null;
  /** Id of the tile inspected at first when uncontrolled. Default: null */
  defaultActiveId?: string | null;
  /** Called with the tile id when inspection moves, or null when it clears. */
  onActiveChange?: (id: string | null) => void;
  /** Override any built-in string. */
  labels?: Partial<TreemapMessages>;
}

export function useTreemapModel({
  data,
  label: customLabel,
  formatValue = defaultFormat,
  colors = TREEMAP_COLORS,
  textColor = "#ffffff",
  activeId,
  defaultActiveId = null,
  onActiveChange,
  labels,
}: TreemapProps) {
  const t = useMessages("treemap", treemapMessages, labels);
  const label = customLabel ?? t("label");
  const model = useMemo(() => buildTreemap(data, colors, textColor), [data, colors, textColor]);
  const [size, setSize] = useState({ width: 1000, height: 625 });
  const tiles = useMemo(
    () => layoutTreemap(model.nodes, size.width, size.height),
    [model.nodes, size],
  );
  const cursor = useRowCursor(tiles, "");
  const {
    activeIndex,
    setActive,
    open: tooltipOpen,
    setOpen: setTooltipOpen,
    plotRef,
    tooltipId,
  } = useInspection({
    ids: tiles.map((tile) => tile.id),
    activeId,
    defaultActiveId,
    onActiveChange,
  });
  const active = tiles[activeIndex] ?? null;
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const registerButton = useCallback((id: string, node: HTMLButtonElement | null) => {
    if (node) buttons.current.set(id, node);
    else buttons.current.delete(id);
  }, []);
  return {
    ...model,
    tiles,
    size,
    setSize,
    label,
    t,
    formatValue,
    active,
    setActive,
    cursor,
    tooltipOpen,
    setTooltipOpen,
    plotRef,
    buttons,
    registerButton,
    tooltipId,
    reduce: useReducedMotion(),
    canHover: useHoverCapable(),
  };
}

export const TreemapContext = createContext<ReturnType<typeof useTreemapModel> | null>(null);

export function useTreemap() {
  const context = useContext(TreemapContext);
  if (!context) throw new Error("Treemap parts must be rendered inside Treemap.");
  return context;
}
