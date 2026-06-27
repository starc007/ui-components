"use client";

import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { RangeSlider } from "@/components/motion/range-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
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
            <div key={c.key} className="block">
              <span className="text-sm font-medium text-foreground">{c.label}</span>
              <div className="mt-2">
                <Select value={v} onValueChange={(next) => onChange(c.key, next)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {c.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {c.hint ? <Hint>{c.hint}</Hint> : null}
            </div>
          );
        }

        if (c.kind === "numberlist") {
          const list = Array.isArray(values[c.key])
            ? (values[c.key] as number[])
            : [];
          const minItems = c.minItems ?? 2;
          const maxItems = c.maxItems ?? 8;
          const b = c.bounds?.(values) ?? { min: 0, max: 100, step: 1 };
          const dec = decimals(b.step);
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
            onChange(c.key, [...list, list[list.length - 1] ?? b.min]);

          return (
            <div key={c.key} className="block">
              <span className="text-sm font-medium text-foreground">
                {c.label}
              </span>
              <div className="mt-3 flex flex-col gap-4">
                {list.map((n, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional checkpoint slots
                  <div key={i}>
                    <span className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        Checkpoint {i + 1}
                        {i === 0
                          ? " (start)"
                          : i === list.length - 1
                            ? " (end)"
                            : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono text-muted-foreground tabular-nums">
                          {+n.toFixed(dec)}
                        </span>
                        {list.length > minItems ? (
                          <button
                            type="button"
                            onClick={() => removeAt(i)}
                            aria-label={`Remove checkpoint ${i + 1}`}
                            className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        ) : null}
                      </span>
                    </span>
                    <RangeSlider
                      className="mt-1.5"
                      aria-label={`Checkpoint ${i + 1}`}
                      min={b.min}
                      max={b.max}
                      step={b.step}
                      value={n}
                      onValueChange={(val) => setAt(i, val)}
                    />
                    {c.describe ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.describe(n, values)}
                      </p>
                    ) : null}
                  </div>
                ))}
                {list.length < maxItems ? (
                  <button
                    type="button"
                    onClick={add}
                    className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add checkpoint
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
