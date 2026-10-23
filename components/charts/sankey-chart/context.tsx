"use client";

import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";
import {
  cleanSankey,
  layoutSankey,
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
  const data = useMemo(() => cleanSankey(nodes, links), [nodes, links]);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const { invalid, cycle } = data.dropped;
    if (invalid.length || cycle.length)
      console.warn(
        `SankeyChart left out ${invalid.length} invalid and ${cycle.length} loop-closing link(s).`,
        { invalid, cycle },
      );
  }, [data]);

  const [size, setSize] = useState({ width: 640, height: 320 });
  // A resize re-lays the chart at once; only a data change springs. The
  // render that commits a new size carries `resized`, so its transitions are
  // instant; the follow-up render has the same targets and starts nothing.
  const sizeKey = `${size.width}x${size.height}`;
  const [settledSize, setSettledSize] = useState(sizeKey);
  const resized = settledSize !== sizeKey;
  useLayoutEffect(() => {
    if (resized) setSettledSize(sizeKey);
  }, [resized, sizeKey]);

  const layout = useMemo(
    () =>
      layoutSankey(data, {
        width: size.width,
        height: size.height,
        nodeWidth,
        nodePadding,
        colors,
      }),
    [data, size, nodeWidth, nodePadding, colors],
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

  // Every drawable flow for the exact-data table, with shares from the
  // cleaned data so the table does not wait on a measured size.
  const totals = new Map<string, number>();
  for (const l of data.links) {
    totals.set(l.source, (totals.get(l.source) ?? 0) + l.value);
  }
  const incoming = new Map<string, number>();
  for (const l of data.links) incoming.set(l.target, (incoming.get(l.target) ?? 0) + l.value);
  const labels = new Map(data.nodes.map((n) => [n.id, n.label]));
  const flows = data.links.map((l) => {
    const sourceValue = Math.max(totals.get(l.source) ?? 0, incoming.get(l.source) ?? 0);
    return {
      id: l.id ?? `${l.source}:${l.target}`,
      source: labels.get(l.source) ?? l.source,
      target: labels.get(l.target) ?? l.target,
      value: l.value,
      share: sourceValue ? l.value / sourceValue : 0,
    };
  });
  const empty = !data.links.length ? (nodes.length ? "No flows to show" : "No sankey data") : null;

  return {
    ...layout,
    flows,
    empty,
    resized,
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
