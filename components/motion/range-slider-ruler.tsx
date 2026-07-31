"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef } from "react";

import { type SliderOptions, useSlider } from "@/lib/hooks/use-slider";
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
    // "72.5 kg" beats a bare "72.5" for a screen reader
    formatValueText: unit ? (v) => `${readout(v)} ${unit}` : undefined,
  });

  const steps = Math.round((max - min) / step);
  const x = useMotionValue(-((current - min) / step) * gap);
  // While the pointer drives the strip (or its momentum still runs), x owns the
  // value; outside of that the value owns x.
  const interacting = useRef(false);

  // ponytail: every tick is in the DOM — fine to a few hundred (80 units at
  // step 0.5 is 161). Window to the visible span if a finer step is ever needed.
  const ticks = Array.from({ length: steps + 1 }, (_, i) => ({
    // toFixed trims float dust from fractional steps (0.1 + 0.2 …).
    value: Number((min + i * step).toFixed(6)),
    major: i % majorEvery === 0,
  }));

  const snapToTick = () => {
    const snapped = -Math.round(-x.get() / gap) * gap;
    if (reduce) {
      x.set(snapped);
      interacting.current = false;
      return;
    }
    animate(x, snapped, SPRING_SNAP).then(() => {
      interacting.current = false;
    });
  };

  // A key press takes the scale back from momentum: without this the coasting
  // strip keeps committing its own value and swallows the keyboard input.
  const rootProps = {
    ...sliderProps,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      x.stop();
      interacting.current = false;
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
        "relative w-full touch-none select-none overflow-hidden",
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
          dragConstraints={{ left: -steps * gap, right: 0 }}
          dragElastic={0.03}
          dragMomentum={!reduce}
          dragTransition={{ power: 0.22, timeConstant: 320 }}
          onDragStart={() => {
            interacting.current = true;
          }}
          // Momentum end when there is momentum, drag end when there is not.
          onDragTransitionEnd={snapToTick}
          onDragEnd={() => {
            if (reduce) snapToTick();
          }}
          style={{ x, marginLeft: -gap / 2 }}
          className="absolute inset-y-0 left-1/2 flex items-end"
        >
          {ticks.map((tick) => (
            // pb reserves the label row, so minor ticks need no spacer node
            <span
              key={tick.value}
              className="relative flex h-full shrink-0 flex-col items-center justify-end pb-[18px]"
              style={{ width: gap }}
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
