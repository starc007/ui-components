"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef } from "react";

import { type SliderOptions, snapSliderValue, useSlider } from "@/lib/hooks/use-slider";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

// Settle spring for the snap after a flick — quick, no overshoot past the tick.
const SPRING_SNAP = { type: "spring", stiffness: 500, damping: 40, mass: 0.6 } as const;

export interface RulerSliderProps extends SliderOptions {
  /** Pixels between two steps. */
  gap?: number;
  /** Label every Nth step; those ticks are drawn tall. */
  majorEvery?: number;
  /** Unit shown next to the value. */
  unit?: string;
  className?: string;
}

/**
 * Ruler slider: the scale scrolls under a fixed needle instead of a handle
 * moving along a track. Flicks carry momentum and settle onto the nearest tick.
 */
export function RulerSlider({
  gap = 14,
  majorEvery = 5,
  unit,
  className,
  ...options
}: RulerSliderProps) {
  const reduce = useReducedMotion();
  // Decimal places the step implies, so 0.5 reads "72.5" and 1 reads "72".
  // Fixed width keeps the readout from jittering as the value rolls; tick
  // labels stay trimmed so a whole-number scale is not littered with ".0".
  // ponytail: reads 0 decimals for an exponential step (1e-7) — no such scale
  // is legible on a ruler anyway, so no parsing beyond this.
  const decimals = String(options.step ?? 1).split(".")[1]?.length ?? 0;
  const readout = (value: number) => value.toFixed(decimals);

  const { current, min, max, step, commit, sliderProps } = useSlider({
    ...options,
    // "72.5 kg" beats a bare "72.5" for a screen reader — but a caller who
    // formats the announcement itself outranks the unit.
    formatValueText:
      options.formatValueText ?? (unit ? (v) => `${readout(v)} ${unit}` : undefined),
  });

  // The range need not divide by the step (0–10 by 4). Full ticks stop at the
  // last whole one and max gets a tick of its own, so the scale never runs past
  // the value the slider can actually report.
  const span = Number(((max - min) / step).toFixed(6));
  const wholeSteps = Math.floor(span);
  const remainder = span - wholeSteps;
  const maxOffset = span * gap;
  const x = useMotionValue(-((current - min) / step) * gap);
  // While the pointer drives the strip (or its momentum still runs), x owns the
  // value; outside of that the value owns x.
  const interacting = useRef(false);
  // True only while the pointer is down. It keeps a cancelled momentum's
  // transition end from snapping underneath a fresh grab.
  const holding = useRef(false);
  // A new gesture or key press bumps this, so a snap that resolves late cannot
  // clear interacting underneath an active drag.
  const gesture = useRef(0);

  // ponytail: every tick is in the DOM — fine to a few hundred (80 units at
  // step 0.5 is 161). Window to the visible span if a finer step is ever needed.
  // Each tick carries an offset because max sits `remainder` of a step past the
  // last whole tick. Whenever remainder is under 0.5 that point falls inside
  // the previous box, so an appended flex box can never centre on it.
  const ticks = Array.from({ length: wholeSteps + 1 }, (_, i) => ({
    // toFixed trims float dust from fractional steps (0.1 + 0.2 …).
    value: Number((min + i * step).toFixed(6)),
    major: i % majorEvery === 0,
    offset: i * gap,
  }));
  // A tiny remainder puts this label close to the one before it. That is what
  // a scale ending a hair past a step looks like.
  if (remainder > 0) ticks.push({ value: max, major: true, offset: maxOffset });

  const snapToTick = () => {
    // The same nearest-tick rule useSlider applies. max counts as a candidate
    // when the step does not divide the range, so a flick near the end does
    // not settle on the last whole step.
    const target = snapSliderValue(min + (-x.get() / gap) * step, min, max, step);
    const snapped = -((target - min) / step) * gap;
    const id = ++gesture.current;
    if (reduce) {
      x.set(snapped);
      interacting.current = false;
      return;
    }
    animate(x, snapped, SPRING_SNAP).then(() => {
      if (gesture.current === id) interacting.current = false;
    });
  };

  // A key press takes the scale back from momentum: without this the coasting
  // strip keeps committing its own value and swallows the keyboard input.
  const rootProps = {
    ...sliderProps,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      x.stop();
      gesture.current++;
      interacting.current = false;
      holding.current = false;
      sliderProps.onKeyDown(event);
    },
  };

  useEffect(() => {
    if (interacting.current) return;
    x.set(-((current - min) / step) * gap);
  }, [current, min, step, gap, x]);

  useMotionValueEvent(x, "change", (v) => {
    if (!interacting.current) return;
    commit(min + (-v / gap) * step);
  });

  return (
    <div
      {...rootProps}
      className={cn(
        "relative w-full touch-none overflow-hidden",
        TOUCH_GESTURE_CLASS,
        options.disabled
          ? "pointer-events-none opacity-50"
          : "cursor-grab active:cursor-grabbing",
        "rounded-2xl outline-none ring-foreground/30 focus-visible:ring-4",
        className,
      )}
    >
      <div className="pointer-events-none flex items-baseline justify-center gap-1 pt-1 pb-3">
        <span className="text-3xl font-semibold tabular-nums text-foreground">
          {readout(current)}
        </span>
        {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
      </div>

      {/* masked, not overlaid with background-coloured gradients — the fade has
          to work on any surface the slider is dropped onto */}
      <div className="relative h-12 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]">
        {/* strip — dragged directly, so momentum comes from the drag gesture */}
        <motion.div
          drag={options.disabled ? false : "x"}
          dragConstraints={{ left: -maxOffset, right: 0 }}
          dragElastic={0.03}
          dragMomentum={!reduce}
          dragTransition={{ power: 0.22, timeConstant: 320 }}
          onDragStart={() => {
            gesture.current++;
            interacting.current = true;
            holding.current = true;
          }}
          // Momentum end when there is momentum, drag end when there is not.
          onDragTransitionEnd={() => {
            if (!holding.current) snapToTick();
          }}
          onDragEnd={() => {
            holding.current = false;
            if (reduce) snapToTick();
          }}
          // The ticks are positioned rather than laid out, so the row needs an
          // explicit width plus half a gap of slop each side to cover the
          // whole drag surface.
          style={{ x, marginLeft: -gap / 2, width: maxOffset + gap }}
          className="absolute inset-y-0 left-1/2"
        >
          {ticks.map((tick) => (
            // pb reserves the label row, so minor ticks need no spacer node
            <span
              key={tick.value}
              className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center pb-[18px]"
              style={{ left: tick.offset + gap / 2 }}
            >
              <span
                className={cn(
                  "w-px rounded-full",
                  // minor ticks at /45 clear the 3:1 non-text floor in both themes
                  tick.major ? "h-7 bg-foreground/70" : "h-3.5 bg-foreground/45",
                )}
              />
              {tick.major ? (
                <span className="absolute bottom-0 text-[10px] tabular-nums text-muted-foreground">
                  {tick.value}
                </span>
              ) : null}
            </span>
          ))}
        </motion.div>

        {/* needle — the read head the scale moves under */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
          <span className="block h-9 w-[3px] rounded-full bg-foreground" />
        </div>
      </div>
    </div>
  );
}
