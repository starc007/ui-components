"use client";

import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import {
  layoutSankey,
  linkId,
  type PlacedLink,
  type PlacedNode,
  SANKEY_COLORS,
  type SankeyLink,
  type SankeyNode,
} from "./model";

export interface SankeyChartProps extends ComponentProps<"section"> {
  nodes: readonly SankeyNode[];
  /** Weighted flows between node ids. Links that would close a loop are left out. */
  links: readonly SankeyLink[];
  label?: string;
  formatValue?: (value: number) => string;
  /** Palette for nodes without their own color, in node order. */
  colors?: readonly string[];
  /** Node bar width in px. */
  nodeWidth?: number;
  /** Space between nodes in a column, in px. */
  nodePadding?: number;
  /** Highlighted node or link id. Controlled. Link ids default to `source:target`. */
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string | null) => void;
}

export type SankeyActive =
  | { type: "node"; node: PlacedNode }
  | { type: "link"; link: PlacedLink };

const defaultFormat = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export function useSankeyModel({
  nodes,
  links,
  label = "Sankey chart",
  formatValue = defaultFormat,
  colors = SANKEY_COLORS,
  nodeWidth = 12,
  nodePadding = 16,
  activeId,
  defaultActiveId = null,
  onActiveChange,
}: SankeyChartProps) {
  const [size, setSize] = useState({ width: 640, height: 320 });
  const layout = useMemo(
    () =>
      layoutSankey(nodes, links, {
        width: size.width,
        height: size.height,
        nodeWidth,
        nodePadding,
        colors,
      }),
    [nodes, links, size, nodeWidth, nodePadding, colors],
  );
  const cursor = useRowCursor(layout.nodes, "");

  const [internalId, setInternalId] = useState(defaultActiveId);
  const requestedId = activeId === undefined ? internalId : activeId;
  // Resolved during render by id: a node or link that left the data clears.
  const node = layout.nodes.find((n) => n.id === requestedId);
  const link = node ? undefined : layout.links.find((l) => l.id === requestedId);
  const active: SankeyActive | null = node
    ? { type: "node", node }
    : link
      ? { type: "link", link }
      : null;
  if (activeId === undefined && internalId !== null && !active) setInternalId(null);

  const latest = useRef({ activeId, requestedId, onActiveChange });
  useLayoutEffect(() => {
    latest.current = { activeId, requestedId, onActiveChange };
  });
  const setActive = useCallback((id: string | null) => {
    const current = latest.current;
    if (current.activeId === undefined) setInternalId(id);
    if (current.requestedId !== id) current.onActiveChange?.(id);
  }, []);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const plotRef = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const registerButton = useCallback((id: string, element: HTMLButtonElement | null) => {
    if (element) buttons.current.set(id, element);
    else buttons.current.delete(id);
  }, []);

  // Every valid flow, for the exact-data table, independent of the layout.
  const known = new Map(nodes.map((n) => [n.id, n.label]));
  const flows = layout.links.length
    ? layout.links.map((l) => ({
        id: l.id,
        source: l.source.label,
        target: l.target.label,
        value: l.value,
        share: l.share,
      }))
    : links
        .filter(
          (l) => known.has(l.source) && known.has(l.target) && Number.isFinite(l.value) && l.value > 0,
        )
        .map((l) => ({
          id: linkId(l),
          source: known.get(l.source) ?? l.source,
          target: known.get(l.target) ?? l.target,
          value: l.value,
          share: 0,
        }));

  return {
    ...layout,
    flows,
    size,
    setSize,
    nodeWidth,
    label,
    formatValue,
    active,
    setActive,
    cursor,
    tooltipOpen,
    setTooltipOpen,
    tooltipId: useId(),
    gradientId: useId(),
    plotRef,
    buttons,
    registerButton,
    reduce: useReducedMotion() ?? false,
    canHover: useHoverCapable(),
  };
}

export type SankeyModel = ReturnType<typeof useSankeyModel>;
export const SankeyContext = createContext<SankeyModel | null>(null);

export function useSankeyChart() {
  const model = useContext(SankeyContext);
  if (!model) throw new Error("Sankey chart parts must be rendered inside SankeyChart.");
  return model;
}

/** Whether a node or link is part of what is highlighted. */
export function emphasis(active: SankeyActive | null) {
  const node = (n: PlacedNode) => {
    if (!active) return true;
    if (active.type === "link") return active.link.source === n || active.link.target === n;
    if (active.node === n) return true;
    return false;
  };
  const link = (l: PlacedLink) => {
    if (!active) return true;
    if (active.type === "link") return active.link === l;
    return l.source === active.node || l.target === active.node;
  };
  return { node, link };
}
