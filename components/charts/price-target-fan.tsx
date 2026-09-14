"use client";

import { cn } from "@/lib/utils";
import { PriceTargetFanContext, usePriceTargetFanModel } from "./price-target-fan/context";
import { PriceTargetFanHeader } from "./price-target-fan/header";
import { PriceTargetFanPlot } from "./price-target-fan/plot";
import type { PriceTargetFanProps } from "./price-target-fan/types";

/** Owns chart data and interaction; children may replace or rearrange the default parts. */
export function PriceTargetFan({ children, className, ...props }: PriceTargetFanProps) {
  const model = usePriceTargetFanModel(props);
  return (
    <PriceTargetFanContext.Provider value={model}>
      <div className={cn("w-[520px] max-w-full [--ink-l:0.5] dark:[--ink-l:1]", className)}>
        {children === undefined ? (
          <>
            <PriceTargetFanHeader />
            <PriceTargetFanPlot />
          </>
        ) : (
          children
        )}
      </div>
    </PriceTargetFanContext.Provider>
  );
}

export { usePriceTargetFan } from "./price-target-fan/context";
export { PriceTargetFanHeader } from "./price-target-fan/header";
export { PriceTargetFanAxes, PriceTargetFanPlot, PriceTargetFanSvg } from "./price-target-fan/plot";
export {
  PriceTargetFanCursor,
  PriceTargetFanHistory,
  PriceTargetFanNow,
  PriceTargetFanTargets,
} from "./price-target-fan/series";
export { PriceTargetFanTooltip } from "./price-target-fan/tooltip";
export type {
  PriceHistoryPoint,
  PriceTarget,
  PriceTargetFanActive,
  PriceTargetFanProps,
} from "./price-target-fan/types";
