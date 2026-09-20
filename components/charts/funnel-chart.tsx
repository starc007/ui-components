"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { buildFunnel, funnelPath, type FunnelStage } from "./funnel-chart/model";

const defaultFormat = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const percentage = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)}%`);
const colors = ["#8b5cf6", "#7774ef", "#548ee4", "#2ca6bc", "#14b8a6"];
export interface FunnelChartProps {
  /** Ordered stages with finite, nonnegative counts; duplicate IDs are omitted. */
  stages: readonly FunnelStage[];
  direction?: "vertical" | "horizontal";
  unit?: string;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
  children?: ReactNode;
}
const Context = createContext<
  | (ReturnType<typeof buildFunnel> & {
      direction: "vertical" | "horizontal";
      unit: string;
      formatValue: (value: number) => string;
    })
  | null
>(null);
export function useFunnelChart() {
  const context = useContext(Context);
  if (!context) throw new Error("Funnel chart parts must be inside FunnelChart");
  return context;
}
export function FunnelChart({
  stages,
  direction = "vertical",
  unit = "people",
  label = "Conversion funnel",
  formatValue = defaultFormat,
  className,
  children,
}: FunnelChartProps) {
  const model = useMemo(() => buildFunnel(stages), [stages]);
  return (
    <Context.Provider value={{ ...model, direction, unit, formatValue }}>
      <section aria-label={label} className={cn("w-full space-y-6", className)}>
        {children === undefined ? (
          <>
            <FunnelChartPlot />
            <FunnelChartSummary />
          </>
        ) : (
          children
        )}
      </section>
    </Context.Provider>
  );
}
export function FunnelChartPlot({ className }: { className?: string }) {
  const { rows, direction, unit, formatValue } = useFunnelChart();
  const reduced = useReducedMotion();
  if (!rows.length)
    return (
      <p className={cn("py-16 text-center text-sm text-muted-foreground", className)}>
        No funnel data
      </p>
    );
  const horizontal = direction === "horizontal";
  const proportions = rows.map((stage) => stage.proportion);
  return (
    <div className={cn("space-y-5", className)}>
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            height: horizontal ? 300 : Math.max(320, rows.length * 72),
            minWidth: horizontal ? rows.length * 110 : 240,
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {rows.map((stage, index) => (
              <motion.path
                key={stage.id}
                fill={stage.color ?? colors[index % colors.length]}
                initial={false}
                // A shared path interpolation keeps adjacent curved boundaries connected.
                animate={{ d: funnelPath(proportions, index, direction) }}
                transition={{ duration: reduced ? 0 : 0.28, ease: EASE_OUT }}
              />
            ))}
          </svg>
          <ol
            aria-label="Funnel stages"
            className="absolute inset-0 grid"
            style={
              horizontal
                ? { gridTemplateColumns: `repeat(${rows.length}, 1fr)` }
                : { gridTemplateRows: `repeat(${rows.length}, 1fr)` }
            }
          >
            {rows.map((stage, index) => (
              <li key={stage.id} className="min-h-0 min-w-0">
                <Tooltip
                  wrapperClassName="block h-full w-full"
                  content={
                    <span className="flex flex-col gap-1.5 text-xs">
                      <span className="text-muted-foreground">{stage.label}</span>
                      <NumberTicker
                        value={stage.value}
                        format={() => formatValue(stage.value)}
                        suffix={` ${unit}`}
                        duration={0.35}
                        startOnView={false}
                        className="font-mono"
                      />
                      {index > 0 && (
                        <>
                          <span>{percentage(stage.stepConversion)} from previous stage</span>
                          <span className="text-muted-foreground">
                            {formatValue(Math.abs(stage.change ?? 0))}{" "}
                            {(stage.change ?? 0) > 0 ? "gained" : "dropped"}
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">
                        {percentage(stage.conversion)} of starting total
                      </span>
                    </span>
                  }
                >
                  <button
                    type="button"
                    className="flex h-full w-full items-center justify-center outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    aria-label={`${stage.label}: ${formatValue(stage.value)} ${unit}, ${percentage(stage.conversion)} of starting total`}
                  >
                    <span className="rounded bg-background/85 px-2 py-1 font-mono text-xs font-medium tabular-nums">
                      {formatValue(stage.value)}
                    </span>
                  </button>
                </Tooltip>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {rows.map((stage, index) => (
          <span key={stage.id} className="inline-flex items-center gap-2 text-xs">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: stage.color ?? colors[index % colors.length] }}
            />
            <span>{stage.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {percentage(stage.conversion)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
export function FunnelChartSummary({ className }: { className?: string }) {
  const { rows, first, last, conversion, formatValue, unit } = useFunnelChart();
  if (!rows.length) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs",
        className,
      )}
    >
      <span className="text-muted-foreground">
        {formatValue(first)} → {formatValue(last)} {unit}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground">Overall conversion</span>
        <span className="font-mono font-medium tabular-nums">{percentage(conversion)}</span>
      </span>
    </div>
  );
}
export type { FunnelStage };
