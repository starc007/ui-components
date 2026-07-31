"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect } from "react";

import { SPRING_GLIDE, SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";
import { type SliderOptions, useSlider } from "@/lib/hooks/use-slider";
import { cn } from "@/lib/utils";

// Loose enough that the bubble keeps leaning a beat after the pointer stops.
const SPRING_TILT = { stiffness: 260, damping: 22, mass: 0.4 } as const;
/** Drag speed (px/s of track percent) that maxes out lean and squash. */
const FULL_TILT = 320;

export interface BubbleSliderProps extends SliderOptions {
  /** Formats the value shown in the bubble. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * Slider with a value bubble that pops out of the thumb on grab and reacts to
 * how fast you drag: it leans into the direction of travel and squashes along
 * the way, then settles upright when you let go.
 */
export function BubbleSlider({ format, className, ...options }: BubbleSliderProps) {
  const reduce = useReducedMotion();
  // A bare number needs no valueText — it would only repeat aria-valuenow.
  const { percent, current, dragging, trackProps, sliderProps } = useSlider({
    ...options,
    formatValueText: options.formatValueText ?? format,
  });
  // The value is already snapped to the step — rounding here would only make
  // the bubble disagree with aria-valuenow on a fractional scale.
  const readout = format ? format(current) : current;

  const target = useMotionValue(percent);
  useEffect(() => {
    target.set(percent);
  }, [percent, target]);
  const smooth = useSpring(target, SPRING_GLIDE);
  const pos = reduce ? target : smooth;
  const left = useMotionTemplate`${pos}%`;

  // One spring drives the whole reaction: lean is signed, squash reads its
  // magnitude. Two springs off the same velocity would just run twice.
  const velocity = useVelocity(pos);
  const lean = useSpring(
    useTransform(velocity, [-FULL_TILT, 0, FULL_TILT], [1, 0, -1], { clamp: true }),
    SPRING_TILT,
  );
  const tilt = useTransform(lean, (v) => v * 16);
  const squash = useTransform(lean, (v) => 1 + Math.abs(v) * 0.18);
  const stretch = useTransform(lean, (v) => 1 - Math.abs(v) * 0.12);

  return (
    <div
      className={cn(
        // px/pb leave room for the thumb, the bubble and the 48px hit area to
        // overhang the 8px track without escaping the component's own box
        "relative flex h-20 w-full items-end px-5 pb-5",
        options.disabled ? "pointer-events-none opacity-50" : undefined,
        className,
      )}
    >
      <div
        {...trackProps}
        className={cn(
          "relative h-2 w-full touch-none select-none rounded-full bg-muted",
          options.disabled ? undefined : "cursor-grab active:cursor-grabbing",
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
          style={{ width: left }}
        />

        {/* thumb — overhangs the track by half its width at both ends, which the
            wrapper's padding leaves room for */}
        <motion.div
          className="absolute top-1/2 size-5 rounded-full border-2 border-foreground bg-background shadow-sm"
          style={{ left, x: "-50%", y: "-50%" }}
          animate={reduce ? undefined : { scale: dragging ? 1.25 : 1 }}
          transition={SPRING_PRESS}
        />

        {/* bubble — anchored to the thumb, leaning with drag velocity */}
        <motion.div
          className="pointer-events-none absolute bottom-6"
          style={{ left, x: "-50%" }}
        >
          <AnimatePresence>
            {dragging ? (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 10 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduce
                    ? { opacity: 0, transition: { duration: 0.12 } }
                    : { opacity: 0, scale: 0.5, y: 8, transition: { duration: 0.12 } }
                }
                transition={reduce ? { duration: 0.12 } : SPRING_PANEL}
                style={
                  reduce
                    ? undefined
                    : { rotate: tilt, scaleX: squash, scaleY: stretch, originY: 1 }
                }
                className="relative rounded-xl bg-foreground px-2.5 py-1 text-sm font-medium tabular-nums text-background shadow-md"
              >
                {readout}
                <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-foreground" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* 8px of track is not a touch target — pad the hit area out to 48px */}
        <button
          type="button"
          {...sliderProps}
          className="absolute -inset-y-5 inset-x-0 touch-none rounded-full outline-none ring-foreground/30 focus-visible:ring-4"
        />
      </div>
    </div>
  );
}
