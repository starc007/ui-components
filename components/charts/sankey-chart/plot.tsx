"use client";

/* Links draw in from left to right once the plot scrolls into view, a column
 * at a time, then nodes fade up at their full size. When the data changes,
 * links and nodes spring to their new geometry; a resize re-lays them at
 * once. Hovering or focusing a node lights it, its flows and the nodes they
 * reach; hovering a flow lights that flow and its two ends; everything else
 * fades. Reduced motion: the chart appears in place and changes without
 * easing. */

import { motion, useInView } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { emphasis, useSankeyChart } from "./context";
import type { PlacedNode } from "./model";

// Link draw-in: each column starts this long after the one before it.
const COLUMN_DELAY = 0.12;
const DRAW_DURATION = 0.7;
// Nodes shorter than this keep their name in the tooltip and table only.
const MIN_LABEL_HEIGHT = 12;
// Gap between a node bar and its label, in px.
const LABEL_GAP = 8;
// Average glyph width of the 12px label face, for fitting labels to a column.
const LABEL_CHAR_WIDTH = 6.6;
// Pointer target around each node bar, and its smallest height (WCAG 2.5.8).
const HIT_SLOP = 4;
const MIN_HIT = 24;
// Flows thinner than this still get this much hover target.
const MIN_LINK_HIT = 8;

export interface SankeyChartPlotProps {
  /** Sets the plot height; default 20rem. The layout follows its measured size. */
  className?: string;
  /** Show each node's value under its label when there is room. */
  showValues?: boolean;
}

/** Fits a label to `room` px, ending in an ellipsis; null when nothing fits. */
function fit(label: string, room: number) {
  const chars = Math.floor(room / LABEL_CHAR_WIDTH);
  if (chars >= label.length) return label;
  if (chars < 4) return null;
  return `${label.slice(0, chars - 1).trimEnd()}…`;
}

export function SankeyChartPlot({ className, showValues = true }: SankeyChartPlotProps) {
  const {
    nodes,
    links,
    columns,
    step,
    nodeWidth,
    size,
    setSize,
    resized,
    active,
    setActive,
    cursor,
    tooltipOpen,
    setTooltipOpen,
    tooltipId,
    gradientId,
    plotRef,
    buttons,
    registerButton,
    formatValue,
    label,
    empty,
    reduce,
    canHover,
  } = useSankeyChart();
  const inView = useInView(plotRef, { once: true, amount: 0.3 });
  const shown = reduce || inView;
  const [entered, setEntered] = useState(false);
  const focusedId = useRef<string | null>(null);
  // useId output can hold characters that break a url(#…) reference.
  const gradient = gradientId.replace(/[^\w-]/g, "");

  useLayoutEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const measure = () => {
      const { width, height } = plot.getBoundingClientRect();
      if (width > 0 && height > 0)
        setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(plot);
    return () => observer.disconnect();
  }, [plotRef, setSize]);

  // A focused node that leaves the data hands focus to the tab stop, so
  // keyboard users are not dropped to the top of the page.
  useLayoutEffect(() => {
    const id = focusedId.current;
    if (!id || nodes.some((node) => node.id === id)) return;
    focusedId.current = null;
    const lost = document.activeElement;
    if (lost === document.body || !plotRef.current?.contains(lost)) {
      const replacement = nodes[Math.max(cursor.activeIndex, 0)];
      if (replacement) buttons.current.get(replacement.id)?.focus();
      else plotRef.current?.focus();
    }
  }, [nodes, cursor.activeIndex, buttons, plotRef]);

  // A tap or click elsewhere dismisses what a tap opened; touch has no hover
  // to leave, so the tooltip would otherwise stay up.
  useEffect(() => {
    if (!tooltipOpen) return;
    const dismiss = (event: globalThis.PointerEvent) => {
      if (plotRef.current?.contains(event.target as Node)) return;
      setTooltipOpen(false);
      setActive(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [tooltipOpen, plotRef, setTooltipOpen, setActive]);

  // A node with any flow to or from the highlighted node lights up with it.
  const lit = emphasis(active);
  const neighbours = new Set<PlacedNode>();
  if (active?.type === "node") {
    for (const link of links) {
      if (link.source === active.node) neighbours.add(link.target);
      if (link.target === active.node) neighbours.add(link.source);
    }
  }
  const nodeLit = (node: PlacedNode) => lit.node(node) || neighbours.has(node);

  const tabStop = nodes[Math.max(cursor.activeIndex, 0)]?.id;
  const ref = useCallback(
    (id: string) => (element: HTMLButtonElement | null) => registerButton(id, element),
    [registerButton],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const current = nodes.find((node) => node.id === target.dataset.sankeyNode);
    if (!current) return;
    if (event.key === "Escape") {
      if (!tooltipOpen) return;
      event.preventDefault();
      setTooltipOpen(false);
      return;
    }
    const center = (node: PlacedNode) => (node.y0 + node.y1) / 2;
    const column = (depth: number) => nodes.filter((node) => node.depth === depth);
    let next: PlacedNode | undefined;
    if (event.key === "Home") next = nodes[0];
    else if (event.key === "End") next = nodes[nodes.length - 1];
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const same = column(current.depth);
      next = same[same.indexOf(current) + (event.key === "ArrowUp" ? -1 : 1)];
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      // Nearest node by height in the next populated column that way.
      const dir = event.key === "ArrowLeft" ? -1 : 1;
      for (let d = current.depth + dir; d >= 0 && d < columns && !next; d += dir) {
        next = column(d).reduce<PlacedNode | undefined>(
          (best, node) =>
            !best ||
            Math.abs(center(node) - center(current)) < Math.abs(center(best) - center(current))
              ? node
              : best,
          undefined,
        );
      }
    } else return;
    event.preventDefault();
    setTooltipOpen(true);
    if (next && next !== current) buttons.current.get(next.id)?.focus();
    else setActive(current.id);
  };

  // Enter alone can be skipped when the pointer jumps straight from one part
  // to another, so moves claim the highlight too; same-value updates bail out.
  // A touch only claims it while pressed, so a scroll does not leave it lit.
  const point = (event: PointerEvent<Element>, id: string) => {
    if (event.pointerType === "touch" ? event.buttons !== 1 : !canHover) return;
    setActive(id);
    setTooltipOpen(true);
  };
  const press = (id: string) => {
    setActive(id);
    setTooltipOpen(true);
  };

  const geometry = reduce || resized ? { duration: 0 } : SPRING_LAYOUT;
  const linkOpacity = (lightUp: boolean) => (active ? (lightUp ? 0.6 : 0.08) : 0.32);
  // Room for a label between its node and the next column's nodes.
  const labelRoom = columns > 1 ? step - nodeWidth - LABEL_GAP * 2 : size.width;
  // Thin flows' hit paths go on top, so a thick neighbour cannot bury them.
  const hitOrder = [...links].sort((a, b) => b.width - a.width);

  return (
    // Scrolls sideways under 32rem. The padding, cancelled by the margin,
    // holds the node hit areas and focus rings that reach past the plot, so
    // the scroller never clips them or scrolls vertically.
    <div className="-m-2 overflow-x-auto overflow-y-hidden p-2">
      {/* biome-ignore lint/a11y/useSemanticElements: This group is a chart, not a collection of form fields. */}
      <div
        ref={plotRef}
        role="group"
        aria-label={`${label} nodes`}
        tabIndex={-1}
        data-slot="sankey-chart-plot"
        className={cn("relative h-80 w-full min-w-[32rem] outline-none", className)}
        onKeyDown={onKeyDown}
        onFocus={(event) => {
          if (event.target instanceof HTMLButtonElement)
            focusedId.current = event.target.dataset.sankeyNode ?? null;
        }}
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          focusedId.current = null;
          setTooltipOpen(false);
          setActive(null);
        }}
        onPointerLeave={(event) => {
          // A lifted finger leaves too; touch dismisses by tapping elsewhere.
          if (event.pointerType === "touch") return;
          setTooltipOpen(false);
          setActive(null);
        }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          aria-hidden="true"
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            {links.map((link, i) => (
              <linearGradient
                key={link.id}
                id={`${gradient}-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={link.x0}
                x2={link.x1}
              >
                <stop offset="0%" stopColor={link.source.color} />
                <stop offset="100%" stopColor={link.target.color} />
              </linearGradient>
            ))}
          </defs>
          <g fill="none" pointerEvents="none">
            {links.map((link, i) => (
              <motion.path
                key={link.id}
                stroke={`url(#${gradient}-${i})`}
                strokeWidth={Math.max(1, link.width)}
                initial={reduce ? false : { d: link.path, pathLength: 0, opacity: 0.32 }}
                animate={
                  shown
                    ? { d: link.path, pathLength: 1, opacity: linkOpacity(lit.link(link)) }
                    : undefined
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        d: geometry,
                        pathLength: {
                          duration: DRAW_DURATION,
                          ease: EASE_OUT,
                          delay: entered ? 0 : link.source.depth * COLUMN_DELAY,
                        },
                        opacity: { duration: 0.16, ease: EASE_OUT },
                      }
                }
                onAnimationComplete={() => setEntered(true)}
              />
            ))}
          </g>
          {/* Static hit paths own hover: never animated, at least MIN_LINK_HIT
              wide, and on the final geometry so the target never drifts. */}
          <g fill="none" stroke="transparent">
            {hitOrder.map((link) => (
              <path
                key={link.id}
                d={link.path}
                strokeWidth={Math.max(MIN_LINK_HIT, link.width)}
                pointerEvents={shown ? "stroke" : "none"}
                className="cursor-pointer"
                onPointerEnter={(event) => point(event, link.id)}
                onPointerMove={(event) => point(event, link.id)}
                onPointerDown={() => press(link.id)}
              />
            ))}
          </g>
          <g pointerEvents="none">
            {nodes.map((node) => (
              <motion.rect
                key={node.id}
                x={node.x0}
                width={node.x1 - node.x0}
                rx={2}
                fill={node.color}
                initial={reduce ? false : { y: node.y0, height: node.y1 - node.y0, opacity: 0 }}
                animate={
                  shown
                    ? {
                        y: node.y0,
                        height: Math.max(1, node.y1 - node.y0),
                        opacity: nodeLit(node) ? 1 : 0.3,
                      }
                    : undefined
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        y: geometry,
                        height: geometry,
                        opacity: {
                          duration: entered ? 0.16 : 0.3,
                          ease: EASE_OUT,
                          delay: entered ? 0 : 0.1 + node.depth * COLUMN_DELAY,
                        },
                      }
                }
              />
            ))}
          </g>
          <g className="text-xs" pointerEvents="none">
            {nodes.map((node) => {
              const h = node.y1 - node.y0;
              if (h < MIN_LABEL_HEIGHT) return null;
              const text = fit(node.label, labelRoom);
              if (!text) return null;
              const last = columns > 1 && node.depth === columns - 1;
              const x = last ? node.x0 - LABEL_GAP : node.x1 + LABEL_GAP;
              const value = formatValue(node.value);
              const twoLines =
                showValues &&
                h >= MIN_LABEL_HEIGHT * 2.4 &&
                value.length * LABEL_CHAR_WIDTH <= labelRoom;
              return (
                <motion.text
                  key={node.id}
                  x={x}
                  textAnchor={last ? "end" : "start"}
                  dominantBaseline="middle"
                  // A halo in the page colour keeps labels readable over the bands.
                  className="fill-foreground stroke-background [paint-order:stroke]"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  initial={reduce ? false : { y: (node.y0 + node.y1) / 2, opacity: 0 }}
                  animate={
                    shown
                      ? { y: (node.y0 + node.y1) / 2, opacity: nodeLit(node) ? 1 : 0.35 }
                      : undefined
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          y: geometry,
                          opacity: {
                            duration: 0.2,
                            ease: EASE_OUT,
                            delay: entered ? 0 : 0.2 + node.depth * COLUMN_DELAY,
                          },
                        }
                  }
                >
                  <tspan x={x} dy={twoLines ? "-0.6em" : 0} className="font-medium">
                    {text}
                  </tspan>
                  {twoLines ? (
                    <tspan x={x} dy="1.2em" className="fill-muted-foreground tabular-nums">
                      {value}
                    </tspan>
                  ) : null}
                </motion.text>
              );
            })}
          </g>
        </svg>
        {nodes.map((node) => {
          const selected = tooltipOpen && active?.type === "node" && active.node === node;
          const h = Math.max(1, node.y1 - node.y0);
          const hit = Math.max(MIN_HIT, h + HIT_SLOP * 2);
          return (
            <button
              key={node.id}
              ref={ref(node.id)}
              type="button"
              data-sankey-node={node.id}
              tabIndex={node.id === tabStop ? 0 : -1}
              aria-label={[
                node.label,
                formatValue(node.value),
                node.inValue && node.outValue
                  ? `in ${formatValue(node.inValue)}, out ${formatValue(node.outValue)}`
                  : null,
                node.description,
              ]
                .filter(Boolean)
                .join(". ")}
              aria-describedby={selected ? tooltipId : undefined}
              className="absolute rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{
                left: node.x0 - HIT_SLOP,
                // Centered on the bar, so a sliver of a node still gets a full target.
                top: node.y0 + h / 2 - hit / 2,
                width: node.x1 - node.x0 + HIT_SLOP * 2,
                height: hit,
                pointerEvents: shown ? "auto" : "none",
              }}
              onPointerEnter={(event) => point(event, node.id)}
              onPointerMove={(event) => point(event, node.id)}
              onPointerDown={() => press(node.id)}
              onFocus={() => {
                cursor.moveTo(node.id);
                setActive(node.id);
                setTooltipOpen(true);
              }}
            />
          );
        })}
        {empty ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {empty}
          </p>
        ) : null}
      </div>
    </div>
  );
}
