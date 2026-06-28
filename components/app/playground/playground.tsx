"use client";

import { RotateCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/motion/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
import { cn } from "@/lib/utils";
import { CodePanel } from "./code-panel";
import { Controls } from "./controls";
import type { ControlValue, ExplainPoint, Preset, Values } from "./core";
import { PLAYGROUND_ITEMS, PLAYGROUND_SOON } from "./items";

/** Plain-English decode of the current code — the teaching layer. */
function ExplainPanel({ points }: { points: ExplainPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
        How it works
      </span>
      <ul className="mt-3 flex flex-col gap-3.5">
        {points.map((p) => (
          <li key={p.code}>
            <code className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {p.code}
            </code>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              {p.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Quick-start preset chips. Plain starting points to play from — the type's
 *  own defaults load first. */
function PresetSection({
  presets,
  onApply,
}: {
  presets: Preset[];
  onApply: (values: Values) => void;
}) {
  if (presets.length === 0) return null;
  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
        Try
      </span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onApply(p.values)}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Playground() {
  const [activeSlug, setActiveSlug] = useState(PLAYGROUND_ITEMS[0].slug);
  const [replayKey, setReplayKey] = useState(0);
  // per-type values so switching types preserves each one's tweaks
  const [valuesByType, setValuesByType] = useState<Record<string, Values>>(() =>
    Object.fromEntries(
      PLAYGROUND_ITEMS.map((it) => [it.slug, { ...it.defaults }]),
    ),
  );

  const active = useMemo(
    () =>
      PLAYGROUND_ITEMS.find((it) => it.slug === activeSlug) ??
      PLAYGROUND_ITEMS[0],
    [activeSlug],
  );
  const values = valuesByType[active.slug];

  const replay = () => setReplayKey((k) => k + 1);

  const select = (slug: string) => {
    setActiveSlug(slug);
    replay();
  };

  const setValue = (key: string, value: ControlValue) => {
    // strip float artifacts from step snapping (0.30000000000000004 -> 0.3)
    const clean =
      typeof value === "number" ? Math.round(value * 1e6) / 1e6 : value;
    setValuesByType((prev) => {
      const merged = { ...prev[active.slug], [key]: clean };
      // let the type reconcile dependent controls (e.g. property -> frames)
      const nextValues = active.coerce ? active.coerce(key, merged) : merged;
      return { ...prev, [active.slug]: nextValues };
    });
    replay();
  };

  const applyPreset = (presetValues: Values) => {
    setValuesByType((prev) => ({
      ...prev,
      [active.slug]: { ...prev[active.slug], ...presetValues },
    }));
    replay();
  };

  const Preview = active.Preview;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:pt-12">
      <header className="mb-8">
        <h1 className="font-pixel text-3xl font-semibold text-foreground md:text-4xl">
          Playground
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Learn motion by playing. Tweak a property, watch it run, read what the
          code is doing line by line, then copy it.
        </p>
      </header>

      {/* mobile type switcher */}
      <div className="mb-6 md:hidden">
        <Select value={active.slug} onValueChange={select}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAYGROUND_ITEMS.map((it) => (
              <SelectItem key={it.slug} value={it.slug}>
                {it.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* sidebar */}
        <nav className="hidden self-start md:sticky md:top-20 md:block">
          <ul className="flex flex-col gap-0.5">
            {PLAYGROUND_ITEMS.map((it) => (
              <li key={it.slug}>
                <button
                  type="button"
                  onClick={() => select(it.slug)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    it.slug === active.slug
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {it.label}
                </button>
              </li>
            ))}
            {PLAYGROUND_SOON.length > 0 ? (
              <li className="mt-3 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Soon
              </li>
            ) : null}
            {PLAYGROUND_SOON.map((it) => (
              <li key={it.slug}>
                <span className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-muted-foreground/40">
                  {it.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        {/* main */}
        <div className="min-w-0">
          {/* vocab: define the type for first-timers */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              {active.label}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {active.blurb}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {/* left column: preview, then code stacked at the same width.
                min-w-0 lets the code panel scroll instead of widening the grid */}
            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-col rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Preview
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={replay}
                    className="gap-1.5"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Replay
                  </Button>
                </div>
                <div className="overflow-hidden px-6 py-10">
                  <Preview values={values} replayKey={replayKey} />
                </div>
              </div>

              <CodePanel code={active.toCode(values)} />
            </div>

            {/* right column: controls, then the plain-English decode */}
            <div className="flex min-w-0 flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-5">
                <PresetSection presets={active.presets} onApply={applyPreset} />
                <div className="mt-5 border-t border-border pt-5">
                  <Controls
                    controls={active.controls}
                    values={values}
                    onChange={setValue}
                  />
                </div>
              </div>

              <ExplainPanel points={active.explain(values)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
