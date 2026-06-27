"use client";

import type { ReactNode } from "react";
import { RangeSlider } from "@/components/motion/range-slider";
import type { ControlDef, ControlValue, Values } from "./core";
import { CurveEditor } from "./curve-editor";

/** Decimal places implied by a step (0.05 -> 2, 1 -> 0). */
function decimals(step: number) {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

export function Controls({
  controls,
  values,
  onChange,
}: {
  controls: ControlDef[];
  values: Values;
  onChange: (key: string, value: ControlValue) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {controls.map((c) => {
        if (c.kind === "slider") {
          const v = typeof values[c.key] === "number" ? (values[c.key] as number) : c.min;
          return (
            <label key={c.key} className="block">
              <span className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-foreground">{c.label}</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {+v.toFixed(decimals(c.step))}
                  {c.unit ?? ""}
                </span>
              </span>
              <RangeSlider
                className="mt-2"
                aria-label={c.label}
                min={c.min}
                max={c.max}
                step={c.step}
                value={v}
                onValueChange={(next) => onChange(c.key, next)}
              />
              {c.hint ? <Hint>{c.hint}</Hint> : null}
            </label>
          );
        }

        if (c.kind === "select") {
          const v = typeof values[c.key] === "string" ? (values[c.key] as string) : c.options[0]?.value;
          return (
            <label key={c.key} className="block">
              <span className="text-sm font-medium text-foreground">{c.label}</span>
              <select
                value={v}
                onChange={(e) => onChange(c.key, e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {c.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {c.hint ? <Hint>{c.hint}</Hint> : null}
            </label>
          );
        }

        // curve
        const v = Array.isArray(values[c.key]) ? (values[c.key] as number[]) : [0.16, 1, 0.3, 1];
        return (
          <div key={c.key}>
            <span className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{c.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                [{v.map((n) => +n.toFixed(2)).join(", ")}]
              </span>
            </span>
            <div className="mt-2 max-w-[240px]">
              <CurveEditor value={v} onChange={(next) => onChange(c.key, next)} />
            </div>
            {c.hint ? <Hint>{c.hint}</Hint> : null}
          </div>
        );
      })}
    </div>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{children}</p>
  );
}
