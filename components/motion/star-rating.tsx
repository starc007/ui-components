"use client";

import { Star } from "lucide-react";
import { animate, motion, useReducedMotion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { selectSound } from "@/lib/sounds/select";
import { cn } from "@/lib/utils";

export const starRatingMessages = {
  rating: "Rating",
  star: "{value} of {max} stars",
};

export type StarRatingMessages = typeof starRatingMessages;

export interface StarRatingProps {
  /** Selected stars, 0 for none. */
  value?: number;
  /** The initial rating when uncontrolled. Default: 0 */
  defaultValue?: number;
  /** Called with the new rating when a star is picked. */
  onValueChange?: (value: number) => void;
  /** Number of stars. Default: 5 */
  max?: number;
  /** Shows the value without taking input. */
  readOnly?: boolean;
  /** Dims the stars and stops input. Default: false */
  disabled?: boolean;
  /** Star size in pixels. */
  size?: number;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<StarRatingMessages>;
  /** Play a select whose pitch rises with the rating. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  /** Classes merged onto the root element. */
  className?: string;
}

// One beat per star, so a new rating travels along the row as a wave.
const STAGGER = 0.06;
const FILL = { duration: 0.28, ease: EASE_OUT } as const;
const DRAIN = { duration: 0.18, ease: EASE_OUT } as const;
const PREVIEW = { duration: 0.12, ease: EASE_OUT } as const;
const HOP = { duration: 0.42, ease: EASE_OUT } as const;

// Six sparks around the chosen star, alternating near and far.
const SPARKS = Array.from({ length: 6 }, (_, index) => {
  const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
  const distance = index % 2 === 0 ? 1 : 0.72;
  return { id: index, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, far: index % 2 === 0 };
});

type Sweep = { from: number; to: number };

/**
 * A star rating built as a radio group. A new rating sends a wave down the
 * row: each newly lit star hops and fills in turn, and the chosen star lands
 * last with a pop and a burst of sparks. Lowering it drains the stars right
 * to left. Hovering lifts the star under the pointer and previews the fill.
 */
export function StarRating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  readOnly = false,
  disabled = false,
  size = 20,
  labels,
  sound = false,
  className,
}: StarRatingProps) {
  const t = useMessages("StarRating", starRatingMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const canHover = useHoverCapable();
  const [internal, setInternal] = useState(defaultValue);
  const value = valueProp ?? internal;
  const [hover, setHover] = useState<number | null>(null);
  const playSelect = useSound(selectSound, { enabled: sound });
  // The last change, so fills wave left to right and drains right to left.
  // A hover clears it: previews change at once.
  const [sweep, setSweep] = useState<Sweep | null>(null);
  // Each change to play out: the wave, the pop and the sparks. Its id replays
  // them even when the same star is chosen again.
  const [play, setPlay] = useState<(Sweep & { id: number }) | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const interactive = !readOnly && !disabled;

  const previewing = interactive && canHover && hover !== null;
  const shown = previewing ? hover : value;

  // Any change of value plays, whether it came from a click, a key, or a
  // parent setting `value`. Detected during render, so the wave starts in
  // the same commit as the new value.
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    // Wave from what was lit: the hover preview when there was one.
    const from = previewing ? Math.min(seen, shown) : seen;
    setSeen(value);
    setSweep({ from, to: value });
    setPlay((current) => ({ from, to: value, id: (current?.id ?? 0) + 1 }));
  }
  const burst = play && play.to > 0 ? { star: play.to, id: play.id } : null;

  // The hops and the pop are played on the star faces directly.
  // biome-ignore lint/correctness/useExhaustiveDependencies: plays once per change; `play.id` marks each one.
  useEffect(() => {
    if (!play || reduce || play.to === 0) return;
    const face = (star: number) => buttons.current[star - 1]?.querySelector("[data-star-face]");
    const { from, to } = play;
    const start = to > from ? from + 1 : to;
    for (let star = start; star < to; star++) {
      const el = face(star);
      if (el) animate(el, { y: [0, -6, 0], rotate: [0, -12, 0] }, { ...HOP, delay: (star - start) * STAGGER });
    }
    const chosen = face(to);
    const delay = Math.max(0, to - start) * STAGGER;
    if (chosen) animate(chosen, { scale: [0.6, 1], rotate: [-20, 0] }, { ...SPRING_PRESS, delay });
  }, [play?.id]);
  // Roving tab stop: the checked star, or the first one when nothing is rated.
  const tabStop = Math.max(1, Math.min(value, max));

  /** Where a star sits in the current wave, in seconds. */
  const waveDelay = (star: number) => {
    if (reduce || !sweep) return 0;
    const { from, to } = sweep;
    if (to > from && star > from && star <= to) return (star - from - 1) * STAGGER;
    if (to < from && star > to && star <= from) return (from - star) * STAGGER;
    return 0;
  };

  const select = (next: number) => {
    if (!interactive) return;
    const clamped = Math.max(1, Math.min(max, next));
    // Rises about a semitone per star, so the rating can be heard.
    playSelect({ pitch: 2 ** ((clamped - 1) / 12) });
    // Choosing the star that is already set replays its pop; any other
    // choice plays through the value change above.
    if (clamped === value) {
      setPlay((current) => ({ from: value, to: value, id: (current?.id ?? 0) + 1 }));
      return;
    }
    if (valueProp === undefined) setInternal(clamped);
    onValueChange?.(clamped);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, star: number) => {
    const moves: Record<string, number> = {
      ArrowRight: star + 1,
      ArrowUp: star + 1,
      ArrowLeft: star - 1,
      ArrowDown: star - 1,
      Home: 1,
      End: max,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = Math.max(1, Math.min(max, target));
    buttons.current[next - 1]?.focus();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("rating")}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      onPointerLeave={() => setHover(null)}
      className={cn("inline-flex items-center", disabled && "opacity-50", className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1;
        const filled = star <= shown;
        const lifted = previewing && star === hover && !reduce;
        const delay = previewing ? 0 : waveDelay(star);
        const sparks = burst?.star === star && !reduce ? burst : null;

        return (
          <motion.button
            key={star}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={t("star", { value: star, max })}
            tabIndex={star === tabStop ? 0 : -1}
            disabled={disabled}
            onClick={() => select(star)}
            onKeyDown={(event) => onKeyDown(event, star)}
            onPointerEnter={() => {
              if (!interactive) return;
              setHover(star);
              setSweep(null);
            }}
            className={cn(
              "relative inline-flex items-center justify-center rounded-full p-0.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              interactive ? "cursor-pointer" : "cursor-default",
              readOnly && "pointer-events-none",
            )}
          >
            {sparks ? (
              <span key={sparks.id} aria-hidden="true" className="pointer-events-none absolute inset-0">
                {SPARKS.map((spark) => (
                  <motion.span
                    key={spark.id}
                    className={cn(
                      "absolute top-1/2 left-1/2 rounded-full bg-amber-400",
                      spark.far ? "size-1" : "size-[3px]",
                    )}
                    style={{ translate: "-50% -50%" }}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], x: spark.x * size, y: spark.y * size }}
                    transition={{ duration: 0.45, ease: EASE_OUT, delay: waveDelay(star) + 0.05 }}
                  />
                ))}
              </span>
            ) : null}
            {/* Lift on hover lives on its own layer, so it never fights the
                hop and pop played on the face inside. */}
            <motion.span
              aria-hidden="true"
              className="inline-flex"
              initial={false}
              animate={{ y: lifted ? -3 : 0 }}
              transition={SPRING_PRESS}
            >
              <span data-star-face="" className="relative inline-flex">
                <Star style={{ width: size, height: size }} className="fill-muted text-muted-foreground/30" />
                {/* The fill blooms from the star's centre, and drains back to it. */}
                <motion.span
                  className="absolute inset-0 inline-flex"
                  initial={false}
                  animate={{ clipPath: filled ? "circle(75% at 50% 55%)" : "circle(0% at 50% 55%)" }}
                  transition={
                    reduce ? { duration: 0 } : { ...(previewing ? PREVIEW : filled ? FILL : DRAIN), delay }
                  }
                >
                  <Star
                    style={{ width: size, height: size }}
                    className={cn(
                      "fill-current transition-colors duration-150",
                      previewing && shown !== value ? "text-amber-300" : "text-amber-400",
                    )}
                  />
                </motion.span>
              </span>
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
