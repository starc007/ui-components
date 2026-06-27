"use client";

import { Plus, X } from "lucide-react";
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
            // not a <label>: RangeSlider is a custom control (carries its own
            // aria-label), so a wrapping label would have no associated input.
            <div key={c.key} className="block">
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
            </div>
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

        if (c.kind === "numberlist") {
          const list = Array.isArray(values[c.key])
            ? (values[c.key] as number[])
            : [];
          const minItems = c.minItems ?? 2;
          const maxItems = c.maxItems ?? 8;
          const setAt = (i: number, val: number) =>
            onChange(
              c.key,
              list.map((n, idx) => (idx === i ? val : n)),
            );
          const removeAt = (i: number) =>
            onChange(
              c.key,
              list.filter((_, idx) => idx !== i),
            );
          const add = () =>
            onChange(c.key, [...list, list[list.length - 1] ?? 0]);

          return (
            <div key={c.key} className="block">
              <span className="text-sm font-medium text-foreground">
                {c.label}
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {list.map((n, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional value slots
                  <div key={i} className="relative">
                    <input
                      type="number"
                      aria-label={`${c.label} value ${i + 1}`}
                      value={n}
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      onChange={(e) => setAt(i, Number(e.target.value))}
                      className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                    />
                    {list.length > minItems ? (
                      <button
                        type="button"
                        onClick={() => removeAt(i)}
                        aria-label={`Remove value ${i + 1}`}
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    ) : null}
                  </div>
                ))}
                {list.length < maxItems ? (
                  <button
                    type="button"
                    onClick={add}
                    aria-label="Add value"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              {c.hint ? <Hint>{c.hint}</Hint> : null}
            </div>
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
