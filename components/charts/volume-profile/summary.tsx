"use client";

import { cn } from "@/lib/utils";
import { useVolumeProfile } from "./context";

export function VolumeProfileSummary({ className }: { className?: string }) {
  const { rows, totalVolume, poc, valueArea, formatPrice, formatVolume, unit, color, pocColor } =
    useVolumeProfile();
  if (!rows.length) return null;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4 text-xs sm:grid-cols-3",
        className,
      )}
    >
      <div className="space-y-1.5">
        <dt className="text-muted-foreground">Total volume</dt>
        <dd className="font-mono font-medium tabular-nums">
          {formatVolume(totalVolume)} {unit}
        </dd>
      </div>
      <div className="space-y-1.5">
        <dt className="flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full"
            style={{ backgroundColor: pocColor }}
          />
          Point of control
        </dt>
        <dd className="font-mono font-medium tabular-nums">{poc ? formatPrice(poc.price) : "—"}</dd>
      </div>
      {valueArea ? (
        <div className="col-span-2 space-y-1.5 sm:col-span-1">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            Value area · {Math.round(valueArea.target * 100)}% target
          </dt>
          <dd className="font-mono font-medium tabular-nums">
            {formatPrice(valueArea.priceLow)} – {formatPrice(valueArea.priceHigh)}
          </dd>
          <dd className="text-muted-foreground">{(valueArea.share * 100).toFixed(1)}% of volume</dd>
        </div>
      ) : null}
    </dl>
  );
}
