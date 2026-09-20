"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useBumpChart } from "./context";
import { bumpPath, PLOT } from "./model";

export function BumpChartPlot({ className }: { className?: string }) {
  const { rows, ranks, height, x, y, periods, label, highlighted, setHovered, canHover, reduce } =
    useBumpChart();
  const id = useId();
  if (!periods.length || !ranks.length)
    return (
      <div className={cn("py-16 text-center text-sm text-muted-foreground", className)}>
        No rankings yet
      </div>
    );
  // Keep labels and rank dots readable inside narrow preview containers.
  const width = Math.max(PLOT.width, periods.length * 64);
  return (
    <section
      aria-label={`${label} plot, scroll horizontally for more periods`}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll this overflow region.
      tabIndex={0}
      className={cn(
        "overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${PLOT.width} ${height}`}
        style={{ minWidth: width }}
        className="block w-full overflow-visible"
      >
        <title>{label}</title>
        <desc>
          Ranks run from best at the top to lowest at the bottom. Use the legend to highlight or pin
          a series. Exact values follow in a table.
        </desc>
        {ranks.map((rank) => (
          <line
            key={rank}
            x1={PLOT.left}
            x2={PLOT.width - PLOT.right}
            y1={y(rank)}
            y2={y(rank)}
            className="stroke-border"
            strokeDasharray="2 5"
          />
        ))}
        {periods.map((period, index) => (
          <text
            key={period}
            x={x(index)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {period}
          </text>
        ))}
        {rows.map((row, index) => {
          const clip = `${id}-series-${index}`;
          const dimmed = highlighted !== null && highlighted !== row.id;
          return (
            <motion.g
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: dimmed ? 0.14 : 1 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              onPointerEnter={() => {
                if (canHover) setHovered(row.id);
              }}
              onPointerLeave={() => setHovered(null)}
            >
              <defs>
                <clipPath id={clip}>
                  <motion.rect
                    x="0"
                    y="0"
                    width={PLOT.width}
                    height={height}
                    initial={reduce ? false : { transform: "scaleX(0)" }}
                    animate={{ transform: "scaleX(1)" }}
                    transition={{ duration: 0.28, delay: index * 0.035, ease: EASE_OUT }}
                  />
                </clipPath>
              </defs>
              <g clipPath={`url(#${clip})`}>
                <path
                  d={bumpPath(row.ranks, x, y)}
                  stroke={row.color}
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d={bumpPath(row.ranks, x, y)}
                  stroke="transparent"
                  strokeWidth="16"
                  fill="none"
                />
                {row.ranks.map((rank, point) =>
                  rank == null ? null : (
                    <g key={periods[point]} transform={`translate(${x(point)} ${y(rank)})`}>
                      <circle
                        r="10"
                        className="fill-background"
                        stroke={row.color}
                        strokeWidth="1.5"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={row.color}
                        className="font-mono text-[9px] font-medium"
                      >
                        {rank}
                      </text>
                      <title>
                        {row.name}, {periods[point]}: #{rank}
                      </title>
                    </g>
                  ),
                )}
              </g>
            </motion.g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{label} — exact ranks</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            {periods.map((period) => (
              <th key={period} scope="col">
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.name}</th>
              {row.ranks.map((rank, index) => (
                <td key={periods[index]}>{rank ?? "No data"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
