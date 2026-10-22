"use client";

/* Links draw in from left to right once the plot scrolls into view, a column
 * at a time, then nodes fade up at their full size. When the data changes,
 * links and nodes spring to their new geometry. Hovering or focusing a node
 * lights it, its flows and the nodes they reach; hovering a flow lights that
 * flow and its two ends; everything else fades. Reduced motion: the chart
 * appears in place and changes without easing. */

import { motion, useInView } from "motion/react";
import { type KeyboardEvent, useCallback, useLayoutEffect, useState } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { emphasis, useSankeyChart } from "./context";
import type { PlacedNode } from "./model";

// Link draw-in: each column starts this long after the one before it.
const COLUMN_DELAY = 0.12;
const DRAW_DURATION = 0.7;
// Nodes shorter than this keep their name in the tooltip and table only.
const MIN_LABEL_HEIGHT = 12;
// Pointer target around each node bar, in px on each side.
const HIT_SLOP = 4;

export interface SankeyChartPlotProps {
  /** Sets the plot height; default 20rem. The layout follows its measured size. */
  className?: string;
  /** Show each node's value under its label. */
  showValues?: boolean;
}

export function SankeyChartPlot({ className, showValues = true }: SankeyChartPlotProps) {
  const {
    nodes,
    links,
    columns,
    size,
    setSize,
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
    flows,
    reduce,
    canHover,
  } = useSankeyChart();
  const inView = useInView(plotRef, { once: true, amount: 0.3 });
  const shown = reduce || inView;
  const [entered, setEntered] = useState(false);

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
      const step = event.key === "ArrowLeft" ? -1 : 1;
      for (let d = current.depth + step; d >= 0 && d < columns && !next; d += step) {
        const candidates = column(d);
        next = candidates.reduce<PlacedNode | undefined>(
          (best, node) =>
            !best || Math.abs(center(node) - center(current)) < Math.abs(center(best) - center(current))
              ? node
              : best,
          undefined,
        );
      }
    } else return;
    event.preventDefault();
    setTooltipOpen(true);
    if (next && next !== current) buttons.current.get(next.id)?.focus();
  };

  const linkOpacity = (lightUp: boolean) => (active ? (lightUp ? 0.6 : 0.08) : 0.32);

  return (
    <div className="w-full overflow-x-auto">
      {/* biome-ignore lint/a11y/useSemanticElements: This group is a chart, not a collection of form fields. */}
      <div
        ref={plotRef}
        role="group"
        aria-label="Sankey nodes"
        data-slot="sankey-chart-plot"
        className={cn("relative h-80 w-full min-w-[32rem]", className)}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setTooltipOpen(false);
        }}
        onPointerLeave={() => {
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
                id={`${gradientId}-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={link.source.x1}
                x2={link.target.x0}
              >
                <stop offset="0%" stopColor={link.source.color} />
                <stop offset="100%" stopColor={link.target.color} />
              </linearGradient>
            ))}
          </defs>
          <g fill="none">
            {links.map((link, i) => (
              <motion.path
                key={link.id}
                stroke={`url(#${gradientId}-${i})`}
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
                        d: SPRING_LAYOUT,
                        pathLength: {
                          duration: DRAW_DURATION,
                          ease: EASE_OUT,
                          delay: entered ? 0 : link.source.depth * COLUMN_DELAY,
                        },
                        opacity: { duration: 0.16, ease: EASE_OUT },
                      }
                }
                onAnimationComplete={() => setEntered(true)}
                className={cn(shown && "cursor-pointer")}
                pointerEvents={shown ? "stroke" : "none"}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch" && !canHover) return;
                  setActive(link.id);
                  setTooltipOpen(true);
                }}
                onPointerDown={() => {
                  setActive(link.id);
                  setTooltipOpen(true);
                }}
              />
            ))}
          </g>
          <g>
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
                        y: SPRING_LAYOUT,
                        height: SPRING_LAYOUT,
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
          <g className="text-xs">
            {nodes.map((node) => {
              const h = node.y1 - node.y0;
              if (h < MIN_LABEL_HEIGHT) return null;
              const last = columns > 1 && node.depth === columns - 1;
              const x = last ? node.x0 - 8 : node.x1 + 8;
              const twoLines = showValues && h >= MIN_LABEL_HEIGHT * 2.4;
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
                          y: SPRING_LAYOUT,
                          opacity: {
                            duration: 0.2,
                            ease: EASE_OUT,
                            delay: entered ? 0 : 0.2 + node.depth * COLUMN_DELAY,
                          },
                        }
                  }
                >
                  <tspan x={x} dy={twoLines ? "-0.6em" : 0} className="font-medium">
                    {node.label}
                  </tspan>
                  {twoLines ? (
                    <tspan x={x} dy="1.2em" className="fill-muted-foreground tabular-nums">
                      {formatValue(node.value)}
                    </tspan>
                  ) : null}
                </motion.text>
              );
            })}
          </g>
        </svg>
        {nodes.map((node) => {
          const selected = tooltipOpen && active?.type === "node" && active.node === node;
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
                top: node.y0 - HIT_SLOP,
                width: node.x1 - node.x0 + HIT_SLOP * 2,
                height: Math.max(1, node.y1 - node.y0) + HIT_SLOP * 2,
                pointerEvents: shown ? "auto" : "none",
              }}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch" && !canHover) return;
                setActive(node.id);
                setTooltipOpen(true);
              }}
              onPointerDown={() => {
                setActive(node.id);
                setTooltipOpen(true);
              }}
              onFocus={() => {
                cursor.moveTo(node.id);
                setActive(node.id);
                setTooltipOpen(true);
              }}
            />
          );
        })}
        {!nodes.length ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {flows.length ? "No flows to show" : "No sankey data"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
