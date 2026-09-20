"use client";

import { createContext, useContext, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  buildLiquidityHeatmap,
  pricePosition,
  type LiquiditySnapshot,
} from "./liquidity-heatmap/model";

const formatPrice = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const formatSize = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
const colors = ["#17233b", "#254f80", "#217c90", "#27af98", "#97d56b", "#f4df76"];
function heatColor(value: number, max: number) {
  return colors[
    Math.min(colors.length - 1, Math.floor((max > 0 ? value / max : 0) * colors.length))
  ];
}
interface LiquidityHeatmapProps {
  /** Time-ordered snapshots; use consistent price buckets and stable IDs. */
  snapshots: readonly LiquiditySnapshot[];
  /** Fixed intensity ceiling keeps colors comparable across live updates. */
  maxSize?: number;
  unit?: string;
  label?: string;
  formatPrice?: (price: number) => string;
  formatSize?: (size: number) => string;
  children?: ReactNode;
  className?: string;
}
const Context = createContext<
  | (ReturnType<typeof buildLiquidityHeatmap> & {
      ceiling: number;
      unit: string;
      formatPrice: (value: number) => string;
      formatSize: (value: number) => string;
    })
  | null
>(null);
export function useLiquidityHeatmap() {
  const value = useContext(Context);
  if (!value) throw new Error("Liquidity heatmap parts must be inside LiquidityHeatmap");
  return value;
}
export function LiquidityHeatmap({
  snapshots,
  maxSize,
  unit = "units",
  label = "Liquidity heatmap",
  formatPrice: priceFormatter = formatPrice,
  formatSize: sizeFormatter = formatSize,
  children,
  className,
}: LiquidityHeatmapProps) {
  const model = useMemo(() => buildLiquidityHeatmap(snapshots), [snapshots]);
  const ceiling =
    maxSize !== undefined && Number.isFinite(maxSize) && maxSize > 0 ? maxSize : model.maximum;
  return (
    <Context.Provider
      value={{ ...model, ceiling, unit, formatPrice: priceFormatter, formatSize: sizeFormatter }}
    >
      <section aria-label={label} className={cn("w-full space-y-4", className)}>
        {children ?? (
          <>
            <LiquidityHeatmapPlot />
            <LiquidityHeatmapLegend />
          </>
        )}
      </section>
    </Context.Provider>
  );
}

export function LiquidityHeatmapPlot({ className }: { className?: string }) {
  const { columns, prices, ceiling, unit, formatPrice, formatSize } = useLiquidityHeatmap();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [active, setActive] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const keys = prices.flatMap((price) =>
    columns.map((column) => JSON.stringify([column.id, price])),
  );
  const validCursor = cursor !== null && keys.includes(cursor) ? cursor : keys[0];
  if (cursor !== null && !keys.includes(cursor)) setCursor(null);
  if (active !== null && !keys.includes(active)) setActive(null);
  const activeIndex = active === null ? -1 : keys.indexOf(active);
  const row = Math.floor(activeIndex / columns.length);
  const col = activeIndex % columns.length;
  const selected = activeIndex >= 0 ? columns[col] : null;
  const size = selected?.levels.get(prices[row]);
  let connected = false;
  const path = columns
    .map((column, index) => {
      const y = column.price === undefined ? null : pricePosition(column.price, prices);
      if (y === null) {
        connected = false;
        return "";
      }
      const command = connected ? "L" : "M";
      connected = true;
      return `${command}${index + 0.5},${y}`;
    })
    .join(" ");
  if (!prices.length || !columns.length)
    return (
      <p className={cn("py-16 text-center text-sm text-muted-foreground", className)}>
        No liquidity data
      </p>
    );
  return (
    <div className={cn("overflow-x-auto", className)} ref={root}>
      <div
        className="relative"
        style={{ minWidth: Math.max(480, columns.length * 24), paddingRight: 72 }}
      >
        <div className="relative">
          <table
            aria-label="Liquidity by price and time"
            className="w-full table-fixed border-separate border-spacing-[2px]"
          >
            <thead className="sr-only">
              <tr>
                {columns.map((column) => (
                  <th key={column.id} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.map((price, rowIndex) => (
                <tr key={price}>
                  {columns.map((column, columnIndex) => {
                    const value = column.levels.get(price);
                    const key = JSON.stringify([column.id, price]);
                    const index = rowIndex * columns.length + columnIndex;
                    return (
                      <td key={column.id} className="p-0">
                        <button
                          type="button"
                          data-cell={index}
                          tabIndex={key === validCursor ? 0 : -1}
                          aria-label={`${column.label}, ${formatPrice(price)}: ${value === undefined ? "No data" : `${formatSize(value)} ${unit}`}`}
                          aria-describedby={key === active ? tooltipId : undefined}
                          className="relative block h-6 w-full rounded-[2px] bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:z-10"
                          onPointerEnter={(event) => {
                            if (event.pointerType !== "touch") {
                              anchor.current = event.currentTarget;
                              setActive(key);
                            }
                          }}
                          onPointerLeave={() => setActive(null)}
                          onFocus={(event) => {
                            anchor.current = event.currentTarget;
                            setCursor(key);
                            setActive(key);
                          }}
                          onBlur={() => setActive(null)}
                          onClick={(event) => {
                            anchor.current = event.currentTarget;
                            setActive(key);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setActive(null);
                              return;
                            }
                            const offsets: Record<string, number> = {
                              ArrowRight: 1,
                              ArrowLeft: -1,
                              ArrowDown: columns.length,
                              ArrowUp: -columns.length,
                              Home: -columnIndex,
                              End: columns.length - 1 - columnIndex,
                            };
                            if (!(event.key in offsets)) return;
                            event.preventDefault();
                            const next = Math.max(
                              0,
                              Math.min(keys.length - 1, index + offsets[event.key]),
                            );
                            root.current
                              ?.querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)
                              ?.focus();
                          }}
                        >
                          <motion.span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[2px]"
                            initial={false}
                            animate={{
                              opacity: value === undefined ? 0 : 1,
                              backgroundColor: heatColor(value ?? 0, ceiling),
                            }}
                            transition={{ duration: 0.28, ease: EASE_OUT }}
                          />
                          {key === active && (
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-white"
                            />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div
            aria-hidden="true"
            className="absolute -right-[72px] top-0 bottom-0 flex w-16 flex-col justify-around text-right font-mono text-[10px] tabular-nums text-muted-foreground"
          >
            {prices.map((price) => (
              <span key={price}>{formatPrice(price)}</span>
            ))}
          </div>
          {/* Remount only when trace topology changes; numeric coordinates otherwise interpolate together. */}
          <svg
            key={columns
              .map(
                (column) =>
                  `${column.id}:${column.price !== undefined && pricePosition(column.price, prices) !== null}`,
              )
              .join("|")}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${columns.length} ${prices.length}`}
            preserveAspectRatio="none"
          >
            <motion.path
              initial={false}
              animate={{ d: path }}
              transition={{ duration: reduced ? 0 : 0.28, ease: EASE_OUT }}
              fill="none"
              stroke="black"
              strokeOpacity="0.35"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
            <motion.path
              initial={false}
              animate={{ d: path }}
              transition={{ duration: reduced ? 0 : 0.28, ease: EASE_OUT }}
              fill="none"
              stroke="white"
              strokeOpacity="0.9"
              strokeWidth="1.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div
          aria-hidden="true"
          className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground"
        >
          {columns
            .filter(
              (_, index) =>
                index % Math.max(1, Math.ceil(columns.length / 5)) === 0 ||
                index === columns.length - 1,
            )
            .map((column) => (
              <span key={column.id}>{column.label}</span>
            ))}
        </div>
      </div>
      <Tooltip
        key={active ?? "closed"}
        id={tooltipId}
        open={selected !== null}
        anchorRef={anchor}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        content={
          selected && (
            <span className="flex flex-col gap-1 font-mono text-xs">
              <span className="text-muted-foreground">
                {selected.label} · {formatPrice(prices[row])}
              </span>
              <span className="inline-flex items-center tabular-nums">
                {size === undefined ? "No data" : (
                  <NumberTicker
                    value={size}
                    // Format the original amount so fractional liquidity is preserved.
                    format={() => formatSize(size)}
                    suffix={` ${unit}`}
                    duration={0.35}
                    startOnView={false}
                  />
                )}
              </span>
              {selected.price !== undefined && Number.isFinite(selected.price) && (
                <span className="text-muted-foreground">Market {formatPrice(selected.price)}</span>
              )}
            </span>
          )
        }
      />
    </div>
  );
}

export function LiquidityHeatmapLegend({ className }: { className?: string }) {
  const { ceiling, formatSize, unit } = useLiquidityHeatmap();
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground",
        className,
      )}
    >
      <span>Resting liquidity · {unit}</span>
      <span className="flex items-center gap-2">
        <span>0</span>
        <span aria-hidden="true" className="flex gap-0.5">
          {colors.map((color) => (
            <span
              key={color}
              className="h-2 w-5 rounded-[1px]"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        <span>{formatSize(ceiling)}+</span>
      </span>
    </div>
  );
}
export type { LiquiditySnapshot, LiquidityHeatmapProps };
