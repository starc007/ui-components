"use client";

import { cn } from "@/lib/utils";
import { useBumpChart } from "./context";
import { PLOT } from "./model";
import { BumpChartPoint } from "./point";
import { BumpChartSeriesPath } from "./series";
import { pointKey, useBumpGeometry } from "./use-geometry";

export function BumpChartPlot({ className }: { className?: string }) {
  const { rows, ranks, height, x, y, periods, label, reduce } = useBumpChart();
  const positions = useBumpGeometry(
    rows.flatMap((row) =>
      row.ranks.flatMap((rank, index) =>
        rank == null ? [] : [{ key: pointKey(row.id, periods[index]), x: x(index), y: y(rank) }],
      ),
    ),
    !!reduce,
  );
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
      <div className="relative" style={{ minWidth: width }}>
        <svg
          role="img"
          aria-label={label}
          viewBox={`0 0 ${PLOT.width} ${height}`}
          className="block w-full overflow-visible"
        >
          <title>{label}</title>
          <desc>
            Ranks run from best at the top to lowest at the bottom. Use the legend to highlight or
            pin a series. Exact values follow in a table.
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
          {rows.map((row, index) => (
            <BumpChartSeriesPath
              key={row.id}
              row={row}
              index={index}
              positions={periods.map((period) => positions.get(pointKey(row.id, period)) ?? null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 overflow-clip">
          {rows.map((row, seriesIndex) =>
            row.ranks.map((rank, point) =>
              rank == null ? null : (
                <BumpChartPoint
                  key={`${row.id}-${periods[point]}`}
                  seriesId={row.id}
                  period={periods[point]}
                  seriesIndex={seriesIndex}
                  position={positions.get(pointKey(row.id, periods[point]))}
                />
              ),
            ),
          )}
        </div>
      </div>
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
